import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from 'src/db/entity/users.entity';

export const GetUUID = createParamDecorator((data, ctx: ExecutionContext): Users => {
  const req = ctx.switchToHttp().getRequest();
  return req.user.uuid;
});
