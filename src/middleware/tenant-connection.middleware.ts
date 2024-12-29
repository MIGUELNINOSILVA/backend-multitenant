import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './../tenancy/tenancy.service';

@Injectable()
export class TenantConnectionMiddleware implements NestMiddleware {
    constructor(private readonly tenantService: TenantService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const companyCode = req.headers['company-code'] as string;
        const username = req.headers['username'] as string;
        const password = req.headers['password'] as string;

        if (!companyCode || !username || !password) {
            throw new UnauthorizedException('Missing tenant credentials');
        }

        try {
            await this.tenantService.connectToTenant(companyCode, username, password);
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid tenant credentials');
        }
    }
}