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
import Chat from "./Chat";

interface LobbyPageElementProps {
    lobbyId: string;
    user: User | null;
    setLobby: (_: Lobby | null) => void;
}

interface LobbyState {
    lobbyName: string;
    lobbyId: string;
    lobbyLeader: string;
    hasPassword: boolean;
    lobbyUsers: string[];
    // chatInput: string;
    // chat: any[],    // TODO: figure out a more elegant type choice for this
    alternateDisplay: string,
    passwordInputValue: string,
    joinStatus: string
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
            hasPassword: false,
            lobbyUsers: [],
            alternateDisplay: "",
            passwordInputValue: "",
            joinStatus: "",
        }
        this.updateUsersListener = this.updateUsersListener.bind(this);
        this.joinLobby = this.joinLobby.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    // Update users event listener function
    updateUsersListener() {
        this.getUsersLobby(this.state.lobbyId);
    }

    // Runs when component is loaded
    componentDidMount(): void {
        window.addEventListener(SocketEvent.UPDATE_USER_LIST, this.updateUsersListener);
        this.getLobby(this.props.lobbyId);
    }

    // Clean up event listenders upon unloading
    componentWillUnmount(): void {
        removeEventListener(SocketEvent.UPDATE_USER_LIST, this.updateUsersListener);
    }

    // Get all lobby information
    async getLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY(lobbyId))).then(res => {
            if (res.status != 200) {
                console.error("Could not get lobby");
                this.setState({ alternateDisplay: "This lobby no longer exists" });
                return;
            }
            return res.json();
        }).then((data: any) => {
            if (!data) {
                return;
            }
            this.setState({
                lobbyName: data.name,
                lobbyId: data.id,
                lobbyLeader: data.leader,
                hasPassword: data.password != "",
            });
            this.getUsersLobby(data.id);
        });
    }

    // Get the list of users for a lobby
    async getUsersLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY_USERS(lobbyId))).then(res => res.json()).then((data: any) => {
            this.setState({
                lobbyUsers: data
            });
            if (this.props.user && this.state.lobbyUsers.includes(this.props.user.username)) {
                this.props.setLobby({
                    id: this.state.lobbyId,
                    leader: this.state.lobbyLeader,
                    name: this.state.lobbyName,
                });
            }
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    // Remove a user --> used by the lobby leader to kick joined users
    async removeUser(username: string) {
        if (!this.props.user) {
            return;
        }

        DELETE(requestUrl(ServerRoutes.REMOVE_USER(JSON.stringify(getAuthToken()), this.props.lobbyId, username))).then((res: Response) => {
            if (res.status != 200) {
                console.log("Failed to remove user from lobby");
                return;
            }
            console.log("removed user " + username);
        });
    }

    // Render the users list
    usersList() {
        let output: JSX.Element[] = [];

        this.state.lobbyUsers.forEach((user: string, index: number) => {
            output.push(
                <UserPreview
                    removeUser={this.removeUser}
                    admin={this.state.lobbyLeader == this.props.user?.username}
                    user={this.props.user}
                    owner={this.state.lobbyLeader == user}
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

    // Join the lobby
    joinLobby() {
        if (!this.props.user) {
            return;
        }

        let data = {
            lobbyId: this.props.lobbyId,
            password: this.state.passwordInputValue,   // TODO: implement lobby passwords
            user: getAuthToken(),
        }

        POST(requestUrl(ServerRoutes.JOIN_LOBBY), data).then((res: Response) => {
            if (res.status != 200) {
                res.json().then(data => this.setState({ joinStatus: data.message }));
                return;
            }
            console.log("Joined lobby");
            this.setState({ joinStatus: "" });

            // THIS UPDATES THE SIDEBAR
            this.props.setLobby({
                id: this.state.lobbyId,
                name: this.state.lobbyName,
                leader: this.state.lobbyLeader
            });
            // TODO: Remove the join button and show the chat/other lobby controls
        });
    }

    // Delete the lobby --> used only by the lobby leader
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
            this.setState({ alternateDisplay: "Lobby Successfully Deleted" });
            this.props.setLobby(null);
            // TODO: Navigate to the lobby list page?
        });
    }

    // Leave the lobby --> used by joined users who are NOT the lobby leader
    async leaveLobby() {
        if (!this.props.user) {
            return;
        }

        await DELETE(requestUrl(ServerRoutes.REMOVE_USER(JSON.stringify(getAuthToken()), this.props.lobbyId, this.props.user.username))).then((res: Response) => {
            if (res.status != 200) {
                console.log("Failed to remove self from lobby");
                return;
            }
            console.log("removed self");
            this.setState({ alternateDisplay: "Lobby Successfully Left" });
            this.props.setLobby(null);
        });
    }

    // Update the state of the password textbox
    handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ passwordInputValue: e.target.value })
    }

    render() {
        let showDelete = this.props.user && (this.state.lobbyLeader == this.props.user.username);
        let showJoin = this.props.user && !this.state.lobbyUsers.includes(this.props.user.username);
        let showLeave = this.props.user && !showJoin && !showDelete;
        return (
            <>
                {this.state.alternateDisplay != "" ? <p className="m-5 text-center text-success">{this.state.alternateDisplay}</p> :
                    <div className='lobby-box border border-green'>
                        <div className='container m-0 p-0'>
                            <div className='row m-0 p-0'>

                                {/* LEFT COLUMN */}
                                <div className='col-12 col-md-8 d-flex flex-column m-0 p-0'>

                                    {/* LOBBY NAME */}
                                    <div className='lobby-header-box p-2 border border-green border-medium text-break'>
                                        <span className='h1'>Lobby: </span>
                                        <span className='h1'>{this.state.lobbyName}</span>
                                    </div>

                                    {/* USER LIST */}
                                    <div className="flex-grow-1 p-2">
                                        <h2>Users in Lobby:</h2>
                                        {this.usersList()}
                                    </div>

                                    <div className='col-12 d-md-none chat-box border border-green border-medium'>
                                        {/* {this.chatbox()} */}
                                        <Chat lobbyId={this.props.lobbyId} user={this.props.user} />
                                    </div>

                                    {/* BUTTONS */}
                                    <div className='ready-box border border-green border-medium'>
                                        {/* JOIN BUTTON */}
                                        <input type="button" className="button join-button" value="Ready" />
                                        {showJoin && <>
                                            {/* JOIN BUTTON */}
                                            {this.props.user && <input type="button" className="button join-button" onClick={this.joinLobby} value="Join" />}
                                            {/* PASSWORD INPUT */}
                                            {this.state.hasPassword && <input type="text" placeholder="lobby password" className="button join-button" onChange={this.handlePasswordChange} value={this.state.passwordInputValue} />}
                                        </>}
                                        {/* DELETE LOBBY BUTTON */}
                                        {showDelete && <button onClick={() => this.deleteLobby()} className="button delete-button">Delete Lobby</button>}
                                        {/* LEAVE LOBBY BUTTOn */}
                                        {showLeave && <button onClick={() => this.leaveLobby()} className="button delete-button">Leave Lobby</button>}
                                    </div>
                                </div>

                                {/* CHAT (RIGHT COLUMN) */}
                                <div className='col-4 d-none d-md-block chat-box border border-green border-medium'>
                                    {/* {this.chatbox()} */}
                                    <Chat lobbyId={this.props.lobbyId} user={this.props.user} />
                                </div>

                            </div>
                        </div>
                    </div>
                }

                <button onClick={() => {
                    clientSocketManager?.send(MessageType.GAME_START, { lobbyId: this.props.lobbyId });  // TODO: THIS IS TEMPORARY
                }}>CLICK HERE TO START THE GAME</button>

                {this.state.joinStatus != "" && <div className="text-danger text-center">{this.state.joinStatus}</div>}
            </>
        )
    }
}
