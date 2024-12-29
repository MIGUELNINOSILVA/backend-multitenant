// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantService } from '../tenancy/tenancy.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly tenantService: TenantService,
        private readonly jwtService: JwtService,
    ) { }

    async login(authCredentialsDto: AuthCredentialsDto) {
        const { companyCode, username, password } = authCredentialsDto;

        try {
            // Intentar conectar al tenant
            await this.tenantService.connectToTenant(companyCode, username, password);

            console.log(`conectando ${companyCode} - ${username} - ${password}`);
            // Si la conexión es exitosa, generar token
            const payload = { username, companyCode };
            const accessToken = this.jwtService.sign(payload);

            return {
                accessToken,
                companyCode,
                username
            };

        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}