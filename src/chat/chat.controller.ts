import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly chatService: ChatService,
  ) {}

  @Get('my-chats')
  async getMyChats(@Req() req: Request) {
    const myUserId = Number(req['user'].userId);

    const chats = await this.chatRoomRepository.find({
      where: [{ userOneId: myUserId }, { userTwoId: myUserId }],
    });

    return Promise.all(
      chats.map(async (chat) => {
        const partnerId =
          chat.userOneId === myUserId ? chat.userTwoId : chat.userOneId;

          const partner = await this.userRepository.findOne({
            where: {id: partnerId},
            select: ['id', 'email']
          })

          return {
            id: chat.id,
            partner: partner,
            createdAt: chat.createdAt
          }
      }),
    );
  }

  @Post('send')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Post('create')
  async createChat(
    @Body('partnerEmail') partnerEmail: string,
    @Req() req: Request,
  ) {
    const myUserId = Number(req['user'].userId);

    const partner = await this.userRepository.findOne({
      where: { email: partnerEmail },
    });

    if (!partner) throw new NotFoundException('User not Found');

    const existing = await this.chatRoomRepository.findOne({
      where: [
        { userOneId: myUserId, userTwoId: partner.id },
        { userOneId: partner.id, userTwoId: myUserId },
      ],
    });

    if (existing) return existing;

    const chat = this.chatRoomRepository.create({
      userOneId: myUserId,
      userTwoId: partner.id,
    });

    return await this.chatRoomRepository.save(chat);
  }

  @Get('messages')
  getMessages(@Query('chatId') chatId: string) {
    return this.chatService.getMessages(Number(chatId));
  }
}
