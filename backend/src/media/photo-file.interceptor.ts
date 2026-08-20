import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaStorageService } from './media-storage.service';

@Injectable()
export class PhotoFileInterceptor implements NestInterceptor {
  private readonly interceptor: NestInterceptor;

  constructor(storage: MediaStorageService) {
    const Interceptor = FileInterceptor('file', storage.photoMulterOptions());
    this.interceptor = new Interceptor();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    return this.interceptor.intercept(context, next);
  }
}
