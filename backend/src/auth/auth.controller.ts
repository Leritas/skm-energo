import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { JwtPayloadUser } from '../common/auth/current-user.decorator';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { Public } from '../common/auth/public.decorator';
import { CART_SESSION_COOKIE } from '../cart/cart.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const guestSessionId = request.cookies?.[CART_SESSION_COOKIE] as
      | string
      | undefined;
    return this.authService.register(dto, guestSessionId, response);
  }

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const guestSessionId = request.cookies?.[CART_SESSION_COOKIE] as
      | string
      | undefined;
    return this.authService.login(dto, guestSessionId, response);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser() user: JwtPayloadUser, @Body() dto: LogoutDto) {
    return this.authService.logout(user.userId, dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayloadUser) {
    return this.authService.getMe(user.userId);
  }
}
