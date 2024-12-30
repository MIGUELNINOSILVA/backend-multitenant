import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('clients')
export class Client {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updateAt: Date;
}