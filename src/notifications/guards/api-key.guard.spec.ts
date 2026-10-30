import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(() => {
    delete process.env.PUSH_API_SECRET;
    guard = new ApiKeyGuard();
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException if authorization header is missing', () => {
    const context = createMockContext();
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token does not match', () => {
    const context = createMockContext('Bearer wrong_token');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should return true if token matches default secret', () => {
    const context = createMockContext('Bearer cargo_secret_push_key_2026');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should use custom secret when PUSH_API_SECRET is set', () => {
    process.env.PUSH_API_SECRET = 'my_custom_secret';
    const customGuard = new ApiKeyGuard();
    const context = createMockContext('Bearer my_custom_secret');
    expect(customGuard.canActivate(context)).toBe(true);
  });
});
