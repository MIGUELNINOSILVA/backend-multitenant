// src/tenancy/tenant-init.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantConfig } from './entities/tenant-config.entity';

@Injectable()
export class TenantInitService {
    constructor(
        @InjectRepository(TenantConfig)
        private tenantConfigRepository: Repository<TenantConfig>
    ) { }

    async initializeTenantConfigs() {
        // Verificar si ya existen configuraciones
        const count = await this.tenantConfigRepository.count();
        if (count === 0) {
            // Crear configuración de ejemplo
            const defaultTenant = this.tenantConfigRepository.create({
                companyCode: 'DEFAULT',
                nameCompany: 'Compañía 1',
                schemaName: 'cliente_1',
                status: true,
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: '3152108124',
                database: 'clientes_tenant'
            });

            await this.tenantConfigRepository.save(defaultTenant);
        }
    }
}