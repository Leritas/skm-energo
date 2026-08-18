import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CATALOG_SECTION_PERMISSIONS } from '@skm/specs';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';

@ApiTags('admin-catalog')
@Controller('admin/catalog')
export class CatalogAdminController {
  @Get('access')
  @RequireAnyPermissions(...CATALOG_SECTION_PERMISSIONS)
  @ApiOkResponse({
    description: 'Confirms the caller may access the admin catalog area',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  checkAccess() {
    return { ok: true };
  }
}
