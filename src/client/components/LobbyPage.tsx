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
                <h1>{this.state.lobbyName}</h1>
                {/* FIXME: This should not accquire the username from the props, it should only render a username once the getUser request is complete */}
                {this.props.user && <div>{this.props.user.username}</div>}
            </>
        )
    }
}
