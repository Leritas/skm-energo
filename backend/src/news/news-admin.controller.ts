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
import { Permission } from '@skm/specs';
import {
  CurrentUser,
  type JwtPayloadUser,
} from '../common/auth/current-user.decorator';
import { PermissionsService } from '../common/permissions/permissions.service';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { AdminNewsArticleDto } from './dto/admin-news-article.dto';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { ListNewsAdminQueryDto } from './dto/list-news-admin-query.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { NewsAdminService } from './news-admin.service';

const NEWS_READ_PERMISSIONS = [
  Permission.hasAccessToNews,
  Permission.canManageNews,
] as const;

@ApiTags('admin-news')
@ApiBearerAuth()
@Controller('admin/news')
export class NewsAdminController {
  constructor(
    private readonly newsAdminService: NewsAdminService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  @RequireAnyPermissions(...NEWS_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminNewsArticleDto, isArray: true })
  listArticles(@Query() query: ListNewsAdminQueryDto) {
    return this.newsAdminService.listArticles(query.includeArchived);
  }

  @Post()
  @RequirePermissions(Permission.canManageNews)
  @ApiCreatedResponse({ type: AdminNewsArticleDto })
  @ApiConflictResponse({ description: 'News article slug already exists' })
  createArticle(@Body() dto: CreateNewsArticleDto) {
    return this.newsAdminService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.canManageNews)
  @ApiOkResponse({ type: AdminNewsArticleDto })
  @ApiConflictResponse({ description: 'News article slug already exists' })
  async updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsArticleDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    const permissions = await this.permissionsService.getUserPermissions(
      user.userId,
    );
    return this.newsAdminService.update(id, dto, permissions);
  }

  @Delete(':id')
  @RequirePermissions(Permission.canManageNews)
  @ApiOkResponse({ type: AdminNewsArticleDto })
  archiveArticle(@Param('id', ParseIntPipe) id: number) {
    return this.newsAdminService.softDelete(id);
  }

  @Post(':id/restore')
  @RequirePermissions(Permission.canManageNews)
  @ApiOkResponse({ type: AdminNewsArticleDto })
  restoreArticle(@Param('id', ParseIntPipe) id: number) {
    return this.newsAdminService.restore(id);
  }
}
