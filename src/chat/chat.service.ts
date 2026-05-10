import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>
  ) {}

  async sendMessage(dto: SendMessageDto) {
    const message = this.messageRepository.create({
      chatId: dto.chatId,
      senderId: dto.senderId,
      text: dto.text,
    });

    return await this.messageRepository.save(message);
  }

  async updateMessageStatus(messageId: number, status: string) {
    await this.messageRepository.update(messageId, {
      status,
    });
  }

  async getMessages(chatId: number) {
    return await this.messageRepository.find({
      where: {
        chatId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
