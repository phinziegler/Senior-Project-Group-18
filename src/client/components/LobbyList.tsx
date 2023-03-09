import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { GET, POST } from "../fetch";
import ErrorPage from "../routes/ErrorPage";
import requestUrl from "./requestUrl";
import Lobby from "../../server/lobbies/lobby";
import Environments from "../../shared/Environments";
import { getAuthToken } from "../auth";

interface LobbyListState {
    lobbyList: LobbyList[];
    pathName: string;
}

export default function LobbyList() {
    return <LobbyListElement/>
}

interface LobbyList {
    id: string;
    name: string;
    leader: string;
    hasPassword: boolean;
}

class LobbyListElement extends React.Component<{}, LobbyListState> {
    constructor(props:any) {
        super(props);
        this.state = {
            lobbyList: [],
            pathName: window.location.pathname
        }
        this.getLobbyList();
    }

    /* TODO: check if the user is logged in as the searched account, if they are, also return password information */
    async getLobbyList() {
        GET(requestUrl(ServerRoutes.GET_ALL_LOBBIES)).then(res => res.json()).then((data:any) => {
            this.setState({
                lobbyList: data
            })
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    addLobby() {
        const loc = process.env.NODE_ENV == Environments.PRODUCTION
          ? window.location.protocol + "//" + window.location.host + ServerRoutes.ADD_USER
          : "http://localhost:8000" + ServerRoutes.MAKE_LOBBY;
        POST(loc, { lobbyName: "CLIENT_USERNAME_" + Math.random(), lobbyPassword: "CLIENT_PASSWORD", leader: getAuthToken() })
          .then((res) => {
            res.json().then(obj => console.log(obj.message));
          });
      }

//    async getUsersLobby() {
//
//    }

    link(text: string, path: string) {
        if (path.charAt(0) != "/") {
            path = "/" + path;
        }
        return (
            <div className="col-5">
                <Link onClick={() => this.setState({ pathName: path })}
                    className={"link" + (this.state.pathName == path && " active")}
                    to={path}>{text}
                </Link>
            </div>
        )
    }

    lobbies() {
        let rows: JSX.Element[] = [];
        this.state.lobbyList.forEach((lobby, index) => {
        rows.push(
        <div className="row align-items-center border-bottom border-green no-gutters">
            {this.link(lobby.name, `/lobby/${lobby.id}`)}
            <div className="col-3">{lobby.leader}</div>
            <div className="col-2"><input style={{width: '2vh', height: '2vh'}} type="checkbox" checked={Boolean(lobby.hasPassword)} readOnly={true}/></div>
            <div className="col-2"><input type="button" className="button join-button" value="Join"/></div>
        </div>
        );
        });

        return (
            <div className="container-lobby">
                <div className="row row-header border-bottom border-green align-items-center no-gutters">
                    <div className="col-5">Lobby Name</div>
                    <div className="col-3">Lobby Leader</div>
                    <div className="col-2">Private?</div>
                    <div className="col-2">Join</div>
                </div>
                {rows}
            </div>
        
        )
    }

    render() {

        return (
            <>
                <div className='bg-dark'>
                    <h1 className='text-center text-white'>Lobby List</h1>
                    <button className="btn btn-success" onClick={this.addLobby}>Add Lobby</button>
                    {this.lobbies()}
                </div>
            </>
        )
    }
}
