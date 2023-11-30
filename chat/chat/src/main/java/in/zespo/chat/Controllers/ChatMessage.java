package in.zespo.chat.Controllers;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private String textContent;
    private String sender;
    private MessageType typeOfMessage;
}
