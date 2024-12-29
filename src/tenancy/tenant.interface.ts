export interface TenantConfig {
    companyCode: string;
    schemaName: string;
    status: boolean;
    // Campos adicionales para futura migración a DB separada
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}