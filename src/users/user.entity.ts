import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(id: number, email: string, password: string, createdAt: Date) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }
}