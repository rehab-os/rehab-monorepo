import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { PERMISSIONS_SERVICE_TOKEN, type IPermissionsService } from '../interfaces/permissions-service.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(PERMISSIONS_SERVICE_TOKEN) private permissionsService: IPermissionsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            REQUIRED_PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const userPermissions = await this.permissionsService.getUserPermissions(
            user.id,
            request.headers['x-organization-id'],
            request.headers['x-clinic-id'],
        );

        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}