import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { GET } from "../fetch";
import ErrorPage from "../routes/ErrorPage";
import requestUrl from "./requestUrl";

interface LobbyPageElementProps {
    lobbyId: string;
    user: User | null;
    }

interface LobbyState {
    lobbyName: string;
    lobbyId: string;
    lobbyLeader: string;
    //lobbyUsers: string[];
}

export default function LobbyPage(props:{user:User | null}) {
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
        }
        this.getLobby(props.lobbyId);
    }

    /* TODO: check if the user is logged in as the searched account, if they are, also return password information */
    async getLobby(lobbyId: string) {
        GET(requestUrl(ServerRoutes.GET_LOBBY(lobbyId))).then(res => res.json()).then((data:any) => {
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
//    }

    render() {

        return (
            <>
                <div className='lobby-box border-medium border-green'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-8'>
                                <div className='row' style={{margin:'0px'}}>
                                    <div className='border-green border-medium lobby-header-box' style={{padding:'1vh'}}>
                                        <h1>Lobby: {this.state.lobbyName}</h1>
                                    </div>
                                </div>
                                <div className='row' style={{margin:'0px', padding:'1vh',}}>
                                    <div className='col-9'>Users in Lobby:</div>
                                </div>
                                <div className='row' style={{margin:'0px', padding:'1vh',}}>
                                    {this.props.user && <div className='col-9'>{this.props.user.username}</div>}
                                </div>  
                            </div>
                            <div className='col-4 border-green border-medium chat-box' style={{padding: '1vh'}}>
                                <h3>Chat box</h3>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12 border-green border-medium ready-box'>
                                <input type="button" className="button join-button" value="Ready"/>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
