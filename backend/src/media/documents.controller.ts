import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import { MediaStreamService } from './media-stream.service';
import {
  OptionalJwtAuthGuard,
  type RequestWithOptionalUser,
} from './optional-jwt-auth.guard';

@ApiTags('media')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly mediaStream: MediaStreamService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  getDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithOptionalUser,
  ) {
    return this.mediaStream.getDocument(id, request.user?.userId);
  }
}
