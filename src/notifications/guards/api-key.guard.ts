import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly SECRET_TOKEN =
    process.env.PUSH_API_SECRET || 'cargo_secret_push_key_2026';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${this.SECRET_TOKEN}`) {
      throw new UnauthorizedException(
        'Invalid or missing Authorization Bearer Token',
      );
    }
    return true;
  }
}
