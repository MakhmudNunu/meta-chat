import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<number, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService
  ) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);

    printLog(`User joined room: ${roomId}`);

    return {
      success: true,
      roomId,
    };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatId: number; senderId: number; text: string },
  ) {
    const savedMessage = await this.chatService.sendMessage(data);

    this.server.to(data.chatId.toString()).emit('receiveMessage', savedMessage);

    return savedMessage;
  }

  @SubscribeMessage('messageSeen')
  async handleMessageSeen(
    @MessageBody()
    data: {
      messageId: number;
    },
  ) {
    await this.chatService.updateMessageStatus(data.messageId, 'seen');

    this.server.emit('messageStatusUpdated', {
      messageId: data.messageId,
      status: 'seen',
    });
  }

  @SubscribeMessage('userOnline')
  handleUserOnline(
    @ConnectedSocket() client: Socket,
  ) {

    const userId = client['userId'];

    this.onlineUsers.set(userId, client.id);
    this.server.emit('updateOnlineUsers', Array.from(this.onlineUsers.keys()));
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: {
      chatId: number;
      userId: number;
    },
  ) {
    this.server.to(data.chatId.toString()).emit('userTyping', {
      userId: data.userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody()
    data: {
      chatId: number;
      userId: number;
    },
  ) {
    this.server.to(data.chatId.toString()).emit('userStopTyping', {
      userId: data.userId,
    });
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token as string;

      if (!token) {
        client.disconnect();
        return
      }

      const payload = this.jwtService.verify(token)
      client['userId'] = payload.userId;

      console.log(`User ${payload.userId} connected`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);

        console.log(`User ${userId} disconnected`);
      }
    });

    this.server.emit('updateOnlineUsers', Array.from(this.onlineUsers.keys()));
  }
}

function printLog(text: string) {
  console.log(text);
}
