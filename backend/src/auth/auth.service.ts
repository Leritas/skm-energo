import { createHash, randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthSessionResponse, AuthUserDto } from '@skm/specs';
import { assertPermissions } from '@skm/specs';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const USER_ROLE_SLUG = 'user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSessionResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { slug: USER_ROLE_SLUG },
    });
    if (!userRole) {
      throw new ConflictException('Default user role is missing; run seed');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        roles: {
          create: { roleId: userRole.id },
        },
      },
    });

    return this.issueSession(user.id);
  }

  async login(dto: LoginDto): Promise<AuthSessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSession(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthSessionResponse> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueSession(stored.userId);
  }

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: { userId, tokenHash },
      });
      return;
    }
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getMe(userId: number): Promise<AuthUserDto> {
    return this.buildAuthUser(userId);
  }

  private async issueSession(userId: number): Promise<AuthSessionResponse> {
    const user = await this.buildAuthUser(userId);
    const accessTtl = this.configService.get<string>('JWT_ACCESS_TTL', '15m');
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL', '7d');
    const expiresAt = this.resolveExpiry(refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken, user };
  }

  private async buildAuthUser(userId: number): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissionSet = new Set<string>();
    const roles = user.roles.map((link) => {
      for (const permission of link.role.permissions) {
        permissionSet.add(permission);
      }
      return {
        id: link.role.id,
        slug: link.role.slug,
        name: link.role.name,
      };
    });

    const permissions = assertPermissions([...permissionSet]);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveExpiry(ttl: string): Date {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + amount * multipliers[unit]);
  }
}
