const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

const userNameForm = document.querySelector('#userNameForm');
const chatForm = document.querySelector('#chatForm');
const connectingStatus = document.querySelector('#connectingStatus');
const messageArea = document.querySelector('#messageArea');
const messageInput = document.querySelector('#messageInput');
const userInputField = document.querySelector('.inputField');

const enterButton = document.querySelector('#enterButton');
const sendBtn = document.querySelector('#sendBtn');
let username = "", stompClient;

function connectToServer(event){
    username = userInputField.value.trim();
    if(username.length === 0)            return ;

    userNameForm.style.visibility = 'hidden';
    chatForm.style.visibility = 'visible';

    const socket = new SockJS('http://127.0.0.1:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onSuccess, onFailure);

    event.preventDefault();
}

function onFailure(){
    connectingStatus.textContent = `Couldn't connect the user ${username}. Please try again!`;
    connectingStatus.style.color = 'maroon';
}

function onSuccess(){
    //Step3: Once the connection is successful, the next step is to subscribe to the channel 'public' using the stompClient (a websocket identifier)
    stompClient.subscribe('/topic/public', generateDefaultResponse, failedSubscription);

    //Step4: Assuming step3 is sucessful, next step is to add the response to the chat-screen.
    stompClient.send('/app/chat/addUser',{},JSON.stringify({sender: username, typeOfMessage: 'JOIN'}));
    connectingStatus.style.display = 'none';
}

function generateDefaultResponse(payload){
    let messageBody = JSON.parse(payload.body), messageElement = document.createElement('li'), messageSpan = document.createElement('p'), message;
    
    if(messageBody.typeOfMessage === 'JOIN'){
        messageElement.classList.add('event-message');

        message = document.createTextNode(`${username} joined the room!`);
        messageSpan.appendChild(message);
    }
    else if(messageBody.typeOfMessage === 'LEAVE'){
        messageElement.classList.add('event-message');

        message = document.createTextNode(`${username} left the room!`);
        messageSpan.appendChild(message);
    }
    else{
        messageElement.classList.add('chat-message');

        let avatar = document.createElement('i');
        let avatarText = document.createTextNode(messageBody.sender[0]);
        avatar.appendChild(avatarText);

        avatar.style.backgroundColor = colors[(Math.floor(Math.random()*10))%colors.length];
        avatar.classList.add('avatarLogo');

        let userNameHeader = document.createElement('p');
        userNameHeader.appendChild(document.createTextNode(messageBody.sender));
        userNameHeader.classList.add('nameHeader');

        message = document.createTextNode(messageBody.textContent);

        messageElement.appendChild(avatar);  
        messageSpan.appendChild(userNameHeader);
        messageSpan.appendChild(message);
        messageSpan.classList.add('messageSpan');
    }
    
    messageElement.appendChild(messageSpan);
    messageArea.appendChild(messageElement);

    messageArea.scrollTop = messageArea.scrollHeight;
}

function failedSubscription(){
    alert('No such subcribing channel present in the server');
}

function sendMessage(event){
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient){
        let chatMessage = JSON.stringify({
            sender: username,
            typeOfMessage: 'CHAT',
            textContent: messageContent
        });

        stompClient.send('/app/chat/sendMessage', {}, chatMessage);
        messageInput.value = '';
    }

    event.preventDefault();
}

enterButton.addEventListener('click',connectToServer);
sendBtn.addEventListener('click',sendMessage);
messageInput.addEventListener('keydown',(event)=>{
    if(event.keyCode === 13){
        sendMessage(event);
    }
})
