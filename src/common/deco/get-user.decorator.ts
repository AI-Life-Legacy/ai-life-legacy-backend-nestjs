import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from 'src/db/entity/user.entity';

export const GetUUID = createParamDecorator((data, ctx: ExecutionContext): Users => {
  const req = ctx.switchToHttp().getRequest();
  return req.user.uuid;
});
