import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantService } from '../tenancy/tenancy.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CacheService } from './cache/cache.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly tenantService: TenantService,
        private readonly jwtService: JwtService,
        private readonly cacheService: CacheService  // Usando un servicio de cache para manejar sesiones
    ) { }

    async login(authCredentialsDto: AuthCredentialsDto) {
        const { companyCode, username, password } = authCredentialsDto;
        console.log(`Intentando login para el usuario: ${username} en la compañía: ${companyCode}`);
    
        try {
            const tenantConnection = await this.tenantService.getTenantConnection(companyCode, username);
            console.log(`Conexión al tenant ${companyCode} exitosa`);
    
            // Validar si existe una sesión activa, invalidarla
            const activeSession = await this.cacheService.getSession(username, companyCode);
            if (activeSession) {
                console.log(`Sesión activa encontrada para el usuario ${username}, invalidando sesión anterior`);
                await this.cacheService.invalidateSession(username, companyCode);
                // Cerrar la conexión activa del tenant
                await this.tenantService.closeTenantConnection(companyCode, username);
            }
    
            // Reintentar la conexión al tenant (esto generará una nueva conexión)
            const newTenantConnection = await this.tenantService.getTenantConnection(companyCode, username);
            const userRepository: Repository<User> = newTenantConnection.getRepository(User);
            const user = await userRepository.findOne({ where: { username } });
    
            if (!user || user.password !== password) {
                console.log(`Credenciales incorrectas para el usuario ${username}`);
                throw new UnauthorizedException('Invalid credentials');
            }
    
            console.log(`Usuario ${username} autenticado correctamente`);
    
            // Generación de token
            const payload = { username, companyCode };
            const accessToken = this.jwtService.sign(payload);
    
            console.log(`Token generado para el usuario ${username}`);
    
            // Guardar la nueva sesión en el cache
            await this.cacheService.saveSession(username, companyCode, accessToken);
    
            return {
                accessToken,
                companyCode,
                username
            };
    
        } catch (error) {
            console.log(`Error en el proceso de login: ${error.message}`);
            throw new UnauthorizedException('Invalid credentials');
        }
    }
    
    

}
