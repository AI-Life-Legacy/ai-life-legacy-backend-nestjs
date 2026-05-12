import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../../db/entity/user.entity';

export const GetUUID = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  if (!req.user) {
    throw new UnauthorizedException('Authentication required');
  }
  return req.user.uuid;
});
