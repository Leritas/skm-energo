import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionsService } from '../common/permissions/permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  findAll() {
    return this.prisma.role.findMany({ orderBy: { slug: 'asc' } });
  }

  async create(dto: CreateRoleDto) {
    const permissions = this.permissionsService.validatePermissionList(
      dto.permissions,
    );
    const existing = await this.prisma.role.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Role slug already exists');
    }

    return this.prisma.role.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        permissions,
        isSystem: false,
      },
    });
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions =
      dto.permissions !== undefined
        ? this.permissionsService.validatePermissionList(dto.permissions)
        : undefined;

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        permissions,
      },
    });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }
}
