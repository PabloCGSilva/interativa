import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column({ unique: true })
    email: string = '';

    @Column()
    password: string = '';

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    constructor(email?: string, password?: string) {
        if (email) this.email = email;
        if (password) this.password = password;
    }
}
