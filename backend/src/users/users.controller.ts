import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@skm/specs';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { SetUserRolesDto } from './dto/set-user-roles.dto';
import { UsersService } from './users.service';

const USER_MANAGEMENT_PERMISSIONS = [
  Permission.canCreateUsers,
  Permission.canDeleteUsers,
  Permission.canManageUserRoles,
  Permission.canCreateRoles,
  Permission.canManageRoles,
] as const;

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireAnyPermissions(...USER_MANAGEMENT_PERMISSIONS)
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findStaff(query);
  }

  @Post()
  @RequirePermissions(Permission.canCreateUsers)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id/roles')
  @RequirePermissions(Permission.canManageUserRoles)
  setRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetUserRolesDto,
  ) {
    return this.usersService.setRoles(id, dto);
  }
}
