// tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './../tenancy/tenancy.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private tenantService: TenantService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const companyCode = req.headers['company-code'] as string;

        if (!companyCode) {
            throw new Error('Company code not provided in headers');
        }

        try {
            await this.tenantService.setTenantSchema(companyCode);
            next();
        } catch (error) {
            next(error);
        }
    }
}