import React from "react";
import { useParams } from "react-router-dom";
import ChatMessage from "../../shared/ChatMessage";
import MessageType from "../../shared/MessageTypes";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { clientSocketManager, getAuthToken } from "../tools/auth";
import { DELETE, GET, POST } from "../tools/fetch";
import ErrorPage from "./ErrorPage";
import requestUrl from "../tools/requestUrl";
import { SocketEvent } from "../websockets/SocketEvent";
import UserPreview from "./UserPreview";
import Lobby from "../../shared/Lobby";

interface LobbyPageElementProps {
    lobbyId: string;
    user: User | null;
    setLobby: (_: Lobby | null) => void;
}

interface LobbyState {
    lobbyName: string;
    lobbyId: string;
    lobbyLeader: string;
    lobbyUsers: string[];
    chatInput: string;
    chat: any[],    // TODO: figure out a more elegant type choice for this
    deleted: boolean,
}

export default function LobbyPage(props: { user: User | null, setLobby: (_: Lobby | null) => void }) {
    const params = useParams();
    if (!params.lobbyId) {
        return <ErrorPage />
    }
    return (
        <LobbyPageElement setLobby={props.setLobby} lobbyId={params.lobbyId} user={props.user} />
    );
}

class LobbyPageElement extends React.Component<LobbyPageElementProps, LobbyState> {

    constructor(props: LobbyPageElementProps) {
        super(props);
        this.state = {
            lobbyName: "",
            lobbyId: "",
            lobbyLeader: "",
            chatInput: "",
            lobbyUsers: [],
            chat: [],
            deleted: false,
        }
        this.chatListener = this.chatListener.bind(this);
        this.updateUsersListener = this.updateUsersListener.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.joinLobby = this.joinLobby.bind(this);
    }

    chatListener(e: any) {
        let chat = this.state.chat;
        chat.push(e.detail);
        this.setState({
            chat: chat
        });
    }

    updateUsersListener() {
        this.getUsersLobby(this.state.lobbyId);
    }

    // Runs when component is loaded
    componentDidMount(): void {
        window.addEventListener(SocketEvent.CHAT, this.chatListener);
        window.addEventListener(SocketEvent.UPDATE_USER_LIST, this.updateUsersListener);
        this.getLobby(this.props.lobbyId);
    }

    // Clean up event listenders
    componentWillUnmount(): void {
        removeEventListener(SocketEvent.CHAT, this.chatListener);
        removeEventListener(SocketEvent.UPDATE_USER_LIST, this.updateUsersListener);
    }

    async getLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY(lobbyId))).then(res => res.json()).then((data: any) => {
            if (!data) {
                console.error("Could not get lobby");
                return;
                // TODO: display a not found message
            }
            this.setState({
                lobbyName: data.name,
                lobbyId: data.id,
                lobbyLeader: data.leader,
            });
            this.getUsersLobby(data.id);
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    async getUsersLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY_USERS(lobbyId))).then(res => res.json()).then((data: any) => {
            this.setState({
                lobbyUsers: data
            });
            if(this.props.user && this.state.lobbyUsers.includes(this.props.user.username)) {
                this.props.setLobby({
                    id: this.state.lobbyId,
                    leader: this.state.lobbyLeader,
                    name: this.state.lobbyName,
                });
            }
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    usersList() {
        let output: JSX.Element[] = [];

        this.state.lobbyUsers.forEach((user: string, index: number) => {
            output.push(
                <UserPreview
                    user={this.props.user}
                    username={user}
                    key={index} />
            );
        });

        return (
            <ul>
                {output}
            </ul>
        );
    }

    sendMessage() {
        if (!this.props.user) {
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

    // Join the lobby
    joinLobby() {
        if (!this.props.user) {
            return;
        }
        let data = {
            lobbyId: this.props.lobbyId,
            password: "",   // TODO: implement lobby passwords
            user: getAuthToken(),
        }

        POST(requestUrl(ServerRoutes.JOIN_LOBBY), data).then((res: Response) => {
            if (res.status != 200) {
                console.log("Failed to join lobby");
                return;
            }
            console.log("Joined lobby");

            // THIS UPDATES THE SIDEBAR
            this.props.setLobby({
                id: this.state.lobbyId,
                name: this.state.lobbyName,
                leader: this.state.lobbyLeader
            });
            // TODO: Remove the join button and show the chat/other lobby controls
        });
    }

    // Delete the lobby
    deleteLobby() {
        if (!this.props.user) {
            return;
        }

        DELETE(requestUrl(ServerRoutes.DELETE_LOBBY(JSON.stringify(getAuthToken()), this.props.lobbyId))).then((res: Response) => {
            if (res.status != 200) {
                console.log("Failed to delete lobby");
                return;
            }
            console.log("Deleted lobby");
            this.setState({ deleted: true });
            this.props.setLobby(null);
            // TODO: Navigate to the lobby list page?
        });
    }

    chat() {
        let output: JSX.Element[] = [];
        this.state.chat.forEach((messageInfo, index) => {
            output.push(
                <li key={index}>{`${messageInfo.user}: ${messageInfo.message}`}</li>
            );
        });
        return <ul>{output}</ul>
    }

    render() {
        let showDelete = this.props.user && (this.state.lobbyLeader == this.props.user.username);
        return (
            <>
                {this.state.deleted ? <p className="m-5 text-center text-success">Lobby Successfully deleted</p> :
                    <div className='lobby-box border-medium border-green'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-8'>
                                    <div className='row' style={{ margin: '0px' }}>
                                        <div className='border-green border-medium lobby-header-box' style={{ padding: '1vh' }}>
                                            <h1>Lobby: {this.state.lobbyName}</h1>
                                        </div>
                                    </div>
                                    <div className='row' style={{ margin: '0px', padding: '1vh', }}>
                                        <div className='col-9'>Users in Lobby:</div>
                                        {this.usersList()}
                                    </div>
                                    <div className='row' style={{ margin: '0px', padding: '1vh', }}>
                                        <div className="col-9">Lobby Leader:</div>
                                        <div className='col-9'>{this.state.lobbyLeader}</div>
                                    </div>
                                </div>
                                <div className='col-4 border-green border-medium chat-box' style={{ padding: '1vh' }}>
                                    <h3>Chat box</h3>
                                    {this.chat()}
                                    <input value={this.state.chatInput} onChange={e => this.setState({ chatInput: e.target.value })} type="text" />
                                    <button onClick={this.sendMessage}>Send</button>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-12 border-green border-medium ready-box'>
                                    <input type="button" className="button join-button" value="Ready" />
                                    {this.props.user && <input type="button" className="button join-button" onClick={this.joinLobby} value="Join" />}
                                    {showDelete && <button onClick={() => this.deleteLobby()} className="btn btn-danger">Delete Lobby</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
}
