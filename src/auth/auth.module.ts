import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TenancyModule } from 'src/tenancy/tenancy.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CacheService } from './cache/cache.service';

@Module({
  imports:[
    TenancyModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envs.SECRET_JWT,
      signOptions: { 
        expiresIn: '1h' 
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, CacheService],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule]
})
export class AuthModule {}
