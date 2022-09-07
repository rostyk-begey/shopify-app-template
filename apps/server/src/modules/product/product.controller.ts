import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { API_ROUTES } from '@google-shopify-crs/shared';
import { ProductService } from './product.service';
import { ShopifySession } from '../app/shopify-session.decorator';
import { Session } from '@shopify/shopify-api/dist/auth/session';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(API_ROUTES.PRODUCTS.COUNT)
  async count(@ShopifySession() session: Session) {
    return this.productService.count(session);
  }

  @Get(API_ROUTES.PRODUCTS.CREATE)
  @HttpCode(200)
  async create(@ShopifySession() session: Session) {
    try {
      await this.productService.create(session);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to process products/create: ${e.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {};
  }
}
