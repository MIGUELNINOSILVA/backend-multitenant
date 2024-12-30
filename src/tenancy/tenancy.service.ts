import { Injectable, OnApplicationBootstrap, UnauthorizedException } from "@nestjs/common";
import { TenantConfig } from "./entities/tenant-config.entity";
import { User } from "../user/entities/user.entity";
import { Connection, createConnection, Repository } from "typeorm";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";

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

    // Método para manejar la conexión con reintentos si las credenciales son incorrectas
    async connectToTenantWithRetry(companyCode: string, username: string, password: string, retries: number = 3): Promise<Connection> {
        let attempt = 0;
        let connection: Connection;

        while (attempt < retries) {
            try {
                connection = await this.connectToTenant(companyCode, username, password);
                return connection; // Si la conexión es exitosa, devolverla
            } catch (error) {
                if (error instanceof UnauthorizedException && attempt < retries - 1) {
                    // Si el error es de autenticación y aún hay intentos, intentamos nuevamente
                    attempt++;
                    console.log(`Intento ${attempt} fallido. Reintentando...`);
                } else {
                    // Si el error no es de autenticación o se agotaron los intentos, lanzamos el error
                    throw error;
                }
            }
        }

        throw new UnauthorizedException('Failed to authenticate after multiple attempts');
    }

    // Método que intenta la conexión al tenant
    async connectToTenant(companyCode: string, username: string, password: string): Promise<Connection> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new UnauthorizedException('Tenant not found');
        }

        const connectionName = `tenant-${companyCode}-${username}`;

        // Verificar si ya existe una conexión activa
        if (this.tenantConnections.has(connectionName)) {
            const existingConnection = this.tenantConnections.get(connectionName);
            if (existingConnection.isConnected) {
                // Si ya está conectado, devolver la conexión existente
                return existingConnection;
            } else {
                // Si la conexión está presente pero no está conectada, cerrarla y crear una nueva
                await this.closeTenantConnection(companyCode, username);
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
                username: username, // Usar las credenciales del payload
                password: password, // Usar las credenciales del payload
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

    // Método para obtener la conexión activa del tenant
    async getCurrentTenantConnection(companyCode: string): Promise<Connection> {
        const connectionName = `tenant-${companyCode}`;
        const connection = this.tenantConnections.get(connectionName);

        if (!connection) {
            throw new UnauthorizedException('No active tenant connection');
        }

        return connection;
    }

    async closeTenantConnection(companyCode: string, username:string): Promise<void> {
        const connectionName = `tenant-${companyCode}-${username}`;
        const connection = this.tenantConnections.get(connectionName);

        if (connection && connection.isConnected) {
            await connection.close();
            this.tenantConnections.delete(connectionName);
        }
    }

    async getTenantConnection(companyCode: string, username:string): Promise<Connection> {
        const config = this.tenantConfigs.get(companyCode);
        if (!config) {
            throw new Error(`Tenant configuration not found for company code: ${companyCode}`);
        }
    
        const connectionName = `tenant-${companyCode}-${username}`;
        
        // Verificar si ya existe una conexión activa
        if (this.tenantConnections.has(connectionName)) {
            const existingConnection = this.tenantConnections.get(connectionName);
            
            if (existingConnection.isConnected) {
                // Si ya está conectada, devolver la conexión existente
                console.log(`Conexión existente detectada para ${connectionName}, cerrándola para crear una nueva.`);
                // Cerrar la conexión anterior si ya está activa
                await this.closeTenantConnection(companyCode, username);
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
                username: config.username, // Usar las credenciales del payload
                password: config.password, // Usar las credenciales del payload
                schema: config.schemaName,  // El schema del tenant
                entities: [User],  // Solo cargamos la entidad User para este tenant
                synchronize: true,
            });
    
            this.tenantConnections.set(connectionName, connection);
            console.log(`Conexión a ${companyCode} - ${username} establecida con éxito.`);
            return connection;
    
        } catch (error) {
            console.error(`Error al conectar al tenant ${companyCode}: ${error.message}`);
            throw new UnauthorizedException('Failed to connect to tenant database');
        }
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
