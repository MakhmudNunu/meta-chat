import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column()
  senderId: number;

  @Column('text')
  text: string;

  @Column({
    default: 'sent',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
