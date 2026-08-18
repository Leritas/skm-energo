import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permission, CATALOG_SECTION_PERMISSIONS } from '@skm/specs';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { CatalogAdminService } from './catalog-admin.service';
import { AdminManufacturerDto } from './dto/admin-manufacturer.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { ListManufacturersAdminQueryDto } from './dto/list-manufacturers-admin-query.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

const MANUFACTURER_READ_PERMISSIONS = [
  Permission.hasAccessToCatalog,
  Permission.canManageManufacturers,
] as const;

@ApiTags('admin-catalog')
@ApiBearerAuth()
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(private readonly catalogAdminService: CatalogAdminService) {}

  @Get('access')
  @RequireAnyPermissions(...CATALOG_SECTION_PERMISSIONS)
  @ApiOkResponse({
    description: 'Confirms the caller may access the admin catalog area',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  checkAccess() {
    return { ok: true };
  }

  @Get('manufacturers')
  @RequireAnyPermissions(...MANUFACTURER_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminManufacturerDto, isArray: true })
  listManufacturers(@Query() query: ListManufacturersAdminQueryDto) {
    return this.catalogAdminService.listManufacturers(query.includeArchived);
  }

  @Post('manufacturers')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiCreatedResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({ description: 'Manufacturer slug already exists' })
  createManufacturer(@Body() dto: CreateManufacturerDto) {
    return this.catalogAdminService.create(dto);
  }

  @Patch('manufacturers/:id')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({ description: 'Manufacturer slug already exists' })
  updateManufacturer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManufacturerDto,
  ) {
    return this.catalogAdminService.update(id, dto);
  }

  @Delete('manufacturers/:id')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({
    description: 'Manufacturer has products and cannot be archived',
  })
  archiveManufacturer(@Param('id', ParseIntPipe) id: number) {
    return this.catalogAdminService.softDelete(id);
  }

  @Post('manufacturers/:id/restore')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  restoreManufacturer(@Param('id', ParseIntPipe) id: number) {
    return this.catalogAdminService.restore(id);
  }
}
