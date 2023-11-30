package in.zespo.chat.config;

import in.zespo.chat.Controllers.ChatMessage;
import in.zespo.chat.Controllers.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private SimpMessageSendingOperations messageTemplate;
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent disConnectEvent){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disConnectEvent.getMessage());
        String username = (String)headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User disconnected: {}",username);
            ChatMessage chatMessage = ChatMessage.builder()
                    .sender(username)
                    .typeOfMessage(MessageType.LEAVE)
                    .build();
            messageTemplate.convertAndSend("/topic/public",chatMessage);
            return;
        }

        return ;
    }
}
