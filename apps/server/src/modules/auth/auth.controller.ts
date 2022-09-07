import { Controller, Get, Req, Res } from '@nestjs/common';
import { API_ROUTES } from '@google-shopify-crs/shared';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(API_ROUTES.AUTH.INDEX)
  auth(@Req() req, @Res() res) {
    return this.authService.redirectToAuth(req, res);
  }

  @Get(API_ROUTES.AUTH.CALLBACK)
  callback(@Req() req, @Res() res) {
    return this.authService.authCallback(req, res);
  }
}
