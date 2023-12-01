import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";

@WebSocketGateway({
    namespace: 'chats'
})
export class ChatsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        console.log(`on connect called : ${socket.id}`)
    }

    @SubscribeMessage('enter_chat')
    enterChat(
        @MessageBody() data: number[],
        @ConnectedSocket() socket: Socket,
    ) {
        for(const chatId of data) {
            socket.join(chatId.toString())
        }
    }

    @SubscribeMessage('send_message')
    sendMessage(
        @MessageBody() message: {message: string, chatId: number},
        @ConnectedSocket() socket: Socket,
    ) {
        this.server.in(
            message.chatId.toString()
        ).emit(
            'receive_message', message.message
        )
    }
}