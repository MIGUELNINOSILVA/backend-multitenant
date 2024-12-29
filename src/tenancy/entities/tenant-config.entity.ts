// src/tenancy/entities/tenant-config.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tenant_configs', { schema: 'public' })
export class TenantConfig {
    @PrimaryColumn()
    companyCode: string;

    @Column()
    schemaName: string;

    @Column()
    status: boolean;

    @Column({ nullable: true })
    host?: string;

    @Column({ nullable: true })
    port?: number;

    @Column({ nullable: true })
    username?: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    database?: string;
}