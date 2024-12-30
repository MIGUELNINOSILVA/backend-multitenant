import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')  // Asegúrate de que la tabla sea 'users' en el esquema dinámico
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;  // Asumimos que la contraseña está cifrada
}
