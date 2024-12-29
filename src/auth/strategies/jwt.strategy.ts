// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { envs } from '../../config/envs';
import { TenantService } from '../../tenancy/tenancy.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private tenantService: TenantService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: envs.SECRET_JWT,
        });
    }

    async validate(payload: any) {
        const { username, companyCode } = payload;

        try {
            // Verificar si el tenant existe
            const tenant = await this.tenantService.getTenantConfig(companyCode);
            if (!tenant) {
                throw new UnauthorizedException();
            }

            return { username, companyCode };
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}