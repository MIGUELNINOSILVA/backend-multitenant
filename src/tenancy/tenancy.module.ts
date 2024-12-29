import { Module, Global, OnModuleInit } from '@nestjs/common';
import { TenantService } from './tenancy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantConfig } from './entities/tenant-config.entity';
import { TenantInitService } from './tenant-init.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([TenantConfig])],
    providers: [TenantService, TenantInitService],
    exports: [TenantService],
})
export class TenancyModule implements OnModuleInit {
    constructor(private tenantInitService: TenantInitService) {}
  
    async onModuleInit() {
      await this.tenantInitService.initializeTenantConfigs();
    }
  }