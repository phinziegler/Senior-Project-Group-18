import React from "react";
import { SocketEvent } from "../websockets/SocketEvent";
import User from "../../shared/User";
import ChatMessage from "../../shared/ChatMessage";
import { clientSocketManager } from "../tools/auth";
import MessageType from "../../shared/MessageTypes";


interface ChatProps {
    user: User | null;
    lobbyId: string;
}

interface ChatState {
    chatInput: string
    chat: any[],            // TODO: figure out a more elegant type choice for this
}

export default class Chat extends React.Component<ChatProps, ChatState> {
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            chatInput: "",
            chat: []
        }

        this.chatListener = this.chatListener.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.handleChatKeyDown = this.handleChatKeyDown.bind(this);

    }

    // Runs when component is loaded
    componentDidMount(): void {
        window.addEventListener(SocketEvent.CHAT, this.chatListener);
    }

    // Clean up event listeners upon unloading
    componentWillUnmount(): void {
        removeEventListener(SocketEvent.CHAT, this.chatListener);
    }

    // Chat event listener function
    chatListener(e: any) {
        let chat = this.state.chat;
        chat.push(e.detail);
        this.setState({
            chat: chat
        });
    }


    // Send a chat message
    sendMessage() {
        if (!this.props.user) {
            return;
        }

        // Cannot send blank messages
        if (this.state.chatInput == "") {
            return;
        }

        let data: ChatMessage = { message: this.state.chatInput, user: this.props.user.username, lobbyId: this.props.lobbyId }

        if (!clientSocketManager) {
            console.error("client socket manager is null");
            return;
        }
        clientSocketManager.send(MessageType.CHAT, data);
        this.setState({ chatInput: "" });
    }

    // Render the chat messages
    chat() {
        let output: JSX.Element[] = [];
        this.state.chat.forEach((messageInfo, index) => {
            output.push(
                <div key={index} className={'row ' + (this.props.user && (messageInfo.user == this.props.user.username) ? 'justify-content-end' : '')} style={{ margin: '0px', paddingLeft: '7px', paddingRight: '7px' }}>
                    <div className={'col-8 chat ' + (this.props.user && (messageInfo.user == this.props.user.username) ? 'chat-home' : 'chat-away')}>
                        {`${messageInfo.user}: ${messageInfo.message}`}
                    </div>
                </div>
            );
        });
        return <div className='scroller'>{output}</div>
    }

    // When pressing enter while typing, send message
    handleChatKeyDown(e: React.KeyboardEvent) {
        if (e.key == "Enter") {
            this.sendMessage()
        }
    }

    render() {
        return <>
            <div className='row'>
                {this.chat()}
            </div>

            {/* SEND MESSAGE */}
            <div className="p-2 mw-100 d-flex flex-wrap justify-content-end">
                {/* CHAT MESSAGE INPUT */}
                <input className="chat-text-input flex-grow-1"
                    spellCheck={false}
                    value={this.state.chatInput}
                    onChange={e => this.setState({ chatInput: e.target.value })}
                    type="text"
                    onKeyDown={this.handleChatKeyDown} />
                {/* SEND MESSAGE BUTTON */}
                <button className="button chat-button" onClick={this.sendMessage}>Send</button>
            </div>
        </>
    }
}