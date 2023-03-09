import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ChatMessage from "../../shared/ChatMessage";
import MessageType from "../../shared/MessageTypes";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import clientSocketManager, { SocketEvent } from "../ClientSocketManager";
import { GET } from "../fetch";
import ErrorPage from "../routes/ErrorPage";
import requestUrl from "./requestUrl";

const chatListener = (e: any) => console.log(e.detail);

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
        this.getLobby(props.lobbyId);
        window.addEventListener(SocketEvent.CHAT, chatListener);
        this.sendMessage = this.sendMessage.bind(this);
    }

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
        if (!this.props.user) return;
        let data: ChatMessage = { message: this.state.chatInput, user: this.props.user.username, lobbyId: this.props.lobbyId }
        clientSocketManager.send(MessageType.CHAT, data);
    }

    render() {

        return (
            <>
                <h1>{this.state.lobbyName}</h1>
                {/* FIXME: This should not accquire the username from the props, it should only render a username once the getUser request is complete */}
                {this.props.user && <div>{this.props.user.username}</div>}
                <p>CHAT</p>
                <input onChange={e => this.setState({ chatInput: e.target.value })} type="text" />
                <button onClick={this.sendMessage}>send</button>
            </>
        )
    }
}
