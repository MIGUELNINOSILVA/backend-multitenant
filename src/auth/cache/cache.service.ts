import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);  // Para logging de operaciones
    private sessionStore: Map<string, string> = new Map();  // En un escenario real, usarías Redis o una base de datos

    // Guardar la sesión activa
    async saveSession(username: string, companyCode: string, accessToken: string) {
        try {
            if (!username || !companyCode || !accessToken) {
                throw new Error('Datos inválidos para guardar la sesión');
            }
            const key = this.getSessionKey(username, companyCode);
            this.sessionStore.set(key, accessToken);
            this.logger.log(`Sesión guardada correctamente para ${username} en la compañía ${companyCode}`);
        } catch (error) {
            this.logger.error(`Error al guardar la sesión para ${username}: ${error.message}`);
            throw error;  // Propagar el error
        }
    }

    // Verificar si existe una sesión activa
    async getSession(username: string, companyCode: string): Promise<string | null> {
        try {
            if (!username || !companyCode) {
                throw new Error('Datos inválidos para verificar la sesión');
            }
            const key = this.getSessionKey(username, companyCode);
            const session = this.sessionStore.get(key);
            if (session) {
                this.logger.log(`Sesión activa encontrada para ${username} en la compañía ${companyCode}`);
            } else {
                this.logger.log(`No se encontró sesión activa para ${username} en la compañía ${companyCode}`);
            }
            return session || null;
        } catch (error) {
            this.logger.error(`Error al verificar la sesión para ${username}: ${error.message}`);
            throw error;  // Propagar el error
        }
    }

    // Invalidar la sesión activa
    async invalidateSession(username: string, companyCode: string) {
        try {
            if (!username || !companyCode) {
                throw new Error('Datos inválidos para invalidar la sesión');
            }
            const key = this.getSessionKey(username, companyCode);
            if (this.sessionStore.has(key)) {
                this.sessionStore.delete(key);
                this.logger.log(`Sesión invalidada correctamente para ${username} en la compañía ${companyCode}`);
            } else {
                this.logger.warn(`No se encontró sesión activa para invalidar para ${username} en la compañía ${companyCode}`);
            }
        } catch (error) {
            this.logger.error(`Error al invalidar la sesión para ${username}: ${error.message}`);
            throw error;  // Propagar el error
        }
    }

    // Generar una clave única para la sesión
    private getSessionKey(username: string, companyCode: string): string {
        return `${companyCode}:${username}`;
    }
}
