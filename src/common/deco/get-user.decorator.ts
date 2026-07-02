import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../../db/entity/user.entity';

export const GetUUID = createParamDecorator((data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  if (!req.user) {
    throw new UnauthorizedException('Authentication required');
  }
  // 일반 유저면 uuid, 뷰어면 authorUserId (AI 채팅 컨텍스트용)
  return req.user.uuid || req.user.authorUserId;
});
