import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import {
  NewsDetailResponseDto,
  NewsListItemResponseDto,
} from './dto/news.dto';
import { NewsService } from './news.service';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: NewsListItemResponseDto, isArray: true })
  listArticles() {
    return this.newsService.listArticles();
  }

  @Public()
  @Get(':slug')
  @ApiOkResponse({ type: NewsDetailResponseDto })
  @ApiNotFoundResponse({ description: 'News article not found' })
  getArticle(@Param('slug') slug: string) {
    return this.newsService.getArticleBySlug(slug);
  }
}
