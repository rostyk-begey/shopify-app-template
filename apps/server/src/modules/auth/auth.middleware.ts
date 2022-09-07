import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response) {
    return this.authService.redirectToAuth(req, res);
  }
}
