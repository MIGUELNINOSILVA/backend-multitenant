import { Injectable, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { Connection, createConnection, Repository } from 'typeorm';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TenantConfig } from './entities/tenant-config.entity';

@Injectable()
export class TenantService implements OnApplicationBootstrap {
    private tenantConfigs: Map<string, TenantConfig> = new Map();
    private tenantConnections: Map<string, Connection> = new Map();

    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        @InjectRepository(TenantConfig)
        private tenantConfigRepository: Repository<TenantConfig>
    ) { }

    async onApplicationBootstrap() {
        await this.loadTenantConfigs();
    }

    private async loadTenantConfigs() {
        const configs = await this.tenantConfigRepository.find({
            where: { status: true }
        });

        configs.forEach((config: TenantConfig) => {
            this.tenantConfigs.set(config.companyCode, config);
        });
    }

    async connectToTenant(companyCode: string, username: string, password: string): Promise<Connection> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new UnauthorizedException('Tenant not found');
        }

        const connectionName = `tenant-${companyCode}`;

        // Verificar si ya existe una conexión activa
        if (this.tenantConnections.has(connectionName)) {
            const existingConnection = this.tenantConnections.get(connectionName);
            if (existingConnection.isConnected) {
                return existingConnection;
            }
        }

        try {
            // Crear nueva conexión
            const connection = await createConnection({
                name: connectionName,
                type: 'postgres',
                host: config.host,
                port: config.port,
                database: config.database,
                username: username,
                password: password,
                schema: config.schemaName,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: true
            });

            this.tenantConnections.set(connectionName, connection);
            return connection;

        } catch (error) {
            throw new UnauthorizedException('Failed to connect to tenant database');
        }
    }

    async getCurrentTenantConnection(companyCode: string): Promise<Connection> {
        const connectionName = `tenant-${companyCode}`;
        const connection = this.tenantConnections.get(connectionName);

        if (!connection) {
            throw new UnauthorizedException('No active tenant connection');
        }

        return connection;
    }

    async closeTenantConnection(companyCode: string): Promise<void> {
        const connectionName = `tenant-${companyCode}`;
        const connection = this.tenantConnections.get(connectionName);

        if (connection && connection.isConnected) {
            await connection.close();
            this.tenantConnections.delete(connectionName);
        }
    }

    async getTenantConnection(companyCode: string): Promise<Connection> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new Error(`Tenant configuration not found for company code: ${companyCode}`);
        }

        // Usar la conexión inyectada
        await this.connection.query(`SET search_path TO "${config.schemaName}"`);

        return this.connection;
    }

    async createTenantSchema(companyCode: string): Promise<void> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new Error(`Tenant configuration not found for company code: ${companyCode}`);
        }

        // Crear nuevo esquema usando la conexión inyectada
        await this.connection.query(`CREATE SCHEMA IF NOT EXISTS "${config.schemaName}"`);

        // Establecer el schema path
        await this.connection.query(`SET search_path TO "${config.schemaName}"`);
    }

    // Método útil para obtener la configuración del tenant
    getTenantConfig(companyCode: string): TenantConfig {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new Error(`Tenant configuration not found for company code: ${companyCode}`);
        }
        return config;
    }

    async setTenantSchema(companyCode: string): Promise<void> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new Error(`Tenant configuration not found for company code: ${companyCode}`);
        }

        await this.connection.query(`SET search_path TO "${config.schemaName}"`);
    }

    async resetToPublicSchema(): Promise<void> {
        await this.connection.query(`SET search_path TO public`);
    }

    async verifySchemaExists(schemaName: string): Promise<boolean> {
        const result = await this.connection.query(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name = $1
        `, [schemaName]);

        return result.length > 0;
    }
}