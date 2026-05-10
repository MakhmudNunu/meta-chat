import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userOneId: number;

  @Column()
  userTwoId: number;

  @CreateDateColumn()
  createdAt: Date;
}