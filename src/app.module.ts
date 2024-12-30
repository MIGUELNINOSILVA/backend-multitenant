import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenancyModule } from './tenancy/tenancy.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { TenantConfig } from './tenancy/entities/tenant-config.entity';
import { TenantConnectionMiddleware } from './middleware/tenant-connection.middleware';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: envs.HOST_DATABASE,
        name: 'default', // Añade esto para especificar el nombre de la conexión
        port: envs.PORT_DATABASE,
        username: envs.USERNAME_DATABASE,
        password: envs.PASSWORD_DATABASE,
        database: envs.NAME_DATABASE,
        entities: [TenantConfig],
        synchronize: true,
      }),
    }),
    TenancyModule,
    AuthModule,
    UserModule
  ],
  exports: [TypeOrmModule] // Añade esto
})
export class AppModule implements NestModule{
  static port: number;

  constructor() {
    AppModule.port = envs.PORT;
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantConnectionMiddleware)
      .exclude('/auth/login') // Excluye rutas que no necesitan tenant
      .forRoutes('*');
  }
}
