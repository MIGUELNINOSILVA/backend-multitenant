import { Command } from 'commander';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantService } from '../tenancy/tenancy.service';
import { getConnection } from 'typeorm';

async function runMigration(companyCode: string) {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantService = app.get(TenantService);

  try {
    // Obtener la conexión del tenant
    const connection = await tenantService.getTenantConnection(companyCode, 'admin'); // 'admin' es un usuario ficticio para la migración

    // Ejecutar las migraciones
    await connection.runMigrations({ transaction: 'all' });
    console.log(`Migraciones ejecutadas correctamente para el tenant ${companyCode}`);
  } catch (error) {
    console.error(`Error ejecutando migraciones para el tenant ${companyCode}:`, error);
  } finally {
    await app.close();
  }
}

const program = new Command();

program
  .version('1.0.0')
  .description('Ejecuta migraciones para un tenant específico')
  .requiredOption('-c, --companyCode <companyCode>', 'Código de la compañía')
  .action((options) => {
    runMigration(options.companyCode);
  });

program.parse(process.argv);