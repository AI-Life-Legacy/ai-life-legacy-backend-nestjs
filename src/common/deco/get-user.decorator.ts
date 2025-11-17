import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../db/entity/user.entity';

export const GetUUID = createParamDecorator((data, ctx: ExecutionContext): User => {
  const req = ctx.switchToHttp().getRequest();
  return req.user.uuid;
});
