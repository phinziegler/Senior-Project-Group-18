import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ChatMessage from "../../shared/ChatMessage";
import MessageType from "../../shared/MessageTypes";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { getAuthToken } from "../auth";
import clientSocketManager, { SocketEvent } from "../ClientSocketManager";
import { GET, POST } from "../fetch";
import ErrorPage from "../routes/ErrorPage";
import requestUrl from "./requestUrl";

const chatListener = (e: any) => console.log(e.detail); // TODO: make this update the chat box

interface LobbyPageElementProps {
    lobbyId: string;
    user: User | null;
}

interface LobbyState {
    lobbyName: string;
    lobbyId: string;
    lobbyLeader: string;
    //lobbyUsers: string[];
    chatInput: string;
}

export default function LobbyPage(props: { user: User | null }) {
    const params = useParams();
    if (!params.lobbyId) {
        return <ErrorPage />
    }
    return (
        <LobbyPageElement lobbyId={params.lobbyId} user={props.user} />
    );
}

class LobbyPageElement extends React.Component<LobbyPageElementProps, LobbyState> {
    constructor(props: LobbyPageElementProps) {
        super(props);
        this.state = {
            lobbyName: "",
            lobbyId: "",
            lobbyLeader: "",
            chatInput: ""
        }
        this.sendMessage = this.sendMessage.bind(this);
        this.joinLobby = this.joinLobby.bind(this);
    }
    
    // Runs when component is loaded
    componentDidMount(): void {
        window.addEventListener(SocketEvent.CHAT, chatListener);
        this.getLobby(this.props.lobbyId);
    }

    // Clean up event listenders
    componentWillUnmount(): void {
        removeEventListener(SocketEvent.CHAT, chatListener);
    }

    /* TODO: check if the user is logged in as the searched account, if they are, also return password information */
    async getLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY(lobbyId))).then(res => res.json()).then((data: any) => {
            this.setState({
                lobbyName: data.name,
                lobbyId: data.id,
                lobbyLeader: data.leader,
            })
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    //    async getUsersLobby() {
    //
    //    }\

    sendMessage() {
        if (!this.props.user) {
            return;
        }
        let data: ChatMessage = { message: this.state.chatInput, user: this.props.user.username, lobbyId: this.props.lobbyId }
        clientSocketManager.send(MessageType.CHAT, data);
        this.setState({chatInput: ""});
    }

    // Join the lobby
    joinLobby() {
        if (!this.props.user) {
            return;
        }
        let data = {
            lobbyId: this.props.lobbyId,
            password: "",   // TODO: implement lobby passwords
            user: getAuthToken(),
            socketId: clientSocketManager.getId()
        }

        POST(requestUrl(ServerRoutes.JOIN_LOBBY), data).then((res: Response) => {
            if(res.status != 200) {
                console.log("Failed to join lobby");
                return;
            }
            console.log("Joined lobby");
            // TODO: Remove the join button and show the chat/other lobby controls
        });
    }

    render() {

        return (
            <>
                <h1>{this.state.lobbyName}</h1>
                {/* FIXME: This should not accquire the username from the props, it should only render a username once the getUser request is complete */}
                {this.props.user && <div>{this.state.lobbyLeader}</div>}
                <p>CHAT</p>
                <input value={this.state.chatInput} onChange={e => this.setState({ chatInput: e.target.value })} type="text" />
                <button onClick={this.sendMessage}>Send</button>
                {this.props.user && <><br /><button className="btn btn-success" onClick={this.joinLobby}>Join</button></>}
            </>
        )
    }
}
