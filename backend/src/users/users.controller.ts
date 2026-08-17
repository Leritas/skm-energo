import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@skm/specs';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { SetUserRolesDto } from './dto/set-user-roles.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
