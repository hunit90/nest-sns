import {Body, Controller, Headers, Post, Request, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import {MaxLengthPipe, MinLengthPipe, PasswordPipe} from "./pipe/password.pipe";
import {BasicTokenGuard} from "./guard/basic-token.guard";
import {AccessTokenGuard, RefreshTokenGuard} from "./guard/bearer-token.guard";
import {RegisterUserDto} from "./dto/register-user.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true)

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    }
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true)

    const newToken = this.authService.rotateToken(token, true);

    return {
      accessToken: newToken,
    }
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail (
    @Headers('authorization') rawToekn: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToekn, false);

    const credentials = this.authService.decodeBasicToken(token)

    return this.authService.loginWithEmail(credentials)
  }

  @Post('register/email')
  postRegisterEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body)
  }
}
