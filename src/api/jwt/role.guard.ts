import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class WriterOnlyGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseAuth = await super.canActivate(context);
    if (!baseAuth) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // isViewer가 없거나 false여야 함 (일반 유저)
    if (user && !user.isViewer) {
      return true;
    }
    throw new ForbiddenException('작성자 전용 API입니다.');
  }
}

@Injectable()
export class ViewerOnlyGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseAuth = await super.canActivate(context);
    if (!baseAuth) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // isViewer가 true여야 함
    if (user && user.isViewer) {
      return true;
    }
    throw new ForbiddenException('뷰어 전용 API입니다.');
  }
}
