import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';

import { Shopify } from '@shopify/shopify-api';
import { join } from 'path';
import { readFileSync } from 'fs';

import { AuthService } from '../auth/auth.service';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class StaticsController {
  private readonly staticsPath: string;

  constructor(
    private readonly appService: AppService,

    private readonly authService: AuthService,

    private readonly configService: ConfigService,
  ) {
    this.staticsPath = configService.get('staticsPath', { infer: true });
  }

  @Get('/')
  async index(@Req() req, @Res() res) {
    if (typeof req.query.shop !== 'string') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'No shop provided',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await this.appService.isAppInstalled(shop);

    if (!appInstalled) {
      return this.authService.redirectToAuth(req, res);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== '1') {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);
      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(this.staticsPath, 'index.html');

    return res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(readFileSync(htmlFile));
  }
}
