import {MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway} from "@nestjs/websockets";
import {Socket} from "socket.io";

@WebSocketGateway({
    namespace: 'chats'
})
export class ChatsGateway implements OnGatewayConnection {
    handleConnection(socket: Socket) {
        console.log(`on connect called : ${socket.id}`)
    }

    @SubscribeMessage('send_message')
    sendMessage(
        @MessageBody() message: string,
    ) {
        console.log(message)
    }
}