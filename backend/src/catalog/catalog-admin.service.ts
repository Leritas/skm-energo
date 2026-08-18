import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminManufacturerDto } from './dto/admin-manufacturer.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

type ManufacturerRow = Prisma.ManufacturerGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

@Injectable()
export class CatalogAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listManufacturers(includeArchived: boolean): Promise<AdminManufacturerDto[]> {
    const rows = await this.prisma.manufacturer.findMany({
      where: includeArchived ? undefined : { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return rows.map((row) => this.toDto(row));
  }

  async create(dto: CreateManufacturerDto): Promise<AdminManufacturerDto> {
    await this.assertSlugAvailable(dto.slug);

    const row = await this.prisma.manufacturer.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        isPublished: dto.isPublished ?? false,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateManufacturerDto,
  ): Promise<AdminManufacturerDto> {
    const manufacturer = await this.findByIdOrThrow(id);

    if (dto.slug !== undefined && dto.slug !== manufacturer.slug) {
      await this.assertSlugAvailable(dto.slug);
    }

    const row = await this.prisma.manufacturer.update({
      where: { id },
      data: {
        slug: dto.slug,
        name: dto.name,
        isPublished: dto.isPublished,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.toDto(row);
  }

  async softDelete(id: number): Promise<AdminManufacturerDto> {
    const manufacturer = await this.findByIdOrThrow(id);

    if (manufacturer.deletedAt) {
      throw new BadRequestException('Manufacturer is already archived');
    }

    const productCount = await this.prisma.product.count({
      where: { manufacturerId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        'Cannot archive manufacturer while products reference it',
      );
    }

    const row = await this.prisma.manufacturer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.toDto(row);
  }

  async restore(id: number): Promise<AdminManufacturerDto> {
    const manufacturer = await this.findByIdOrThrow(id);

    if (!manufacturer.deletedAt) {
      throw new BadRequestException('Manufacturer is not archived');
    }

    const row = await this.prisma.manufacturer.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.toDto(row);
  }

  private async findByIdOrThrow(id: number) {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id },
    });
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
    return manufacturer;
  }

  private async assertSlugAvailable(slug: string) {
    const existing = await this.prisma.manufacturer.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Manufacturer slug already exists');
    }
  }

  private toDto(row: ManufacturerRow): AdminManufacturerDto {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      isPublished: row.isPublished,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      productCount: row._count.products,
    };
  }
}
