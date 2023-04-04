import React from "react";
import { Link } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { GET, POST } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";
import Environments from "../../shared/Environments";
import { getAuthToken } from "../tools/auth";

interface LobbyListState {
    lobbyList: LobbyList[];
    pathName: string;
}

export default function LobbyList() {
    return <LobbyListElement />
}

interface LobbyList {
    id: string;
    name: string;
    leader: string;
    password: string;
}

class LobbyListElement extends React.Component<{}, LobbyListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            lobbyList: [],
            pathName: window.location.pathname
        }
    }

    componentDidMount(): void {
        this.getLobbyList();
    }

    /* TODO: check if the user is logged in as the searched account, if they are, also return password information */
    async getLobbyList() {
        GET(requestUrl(ServerRoutes.GET_ALL_LOBBIES)).then(res => res.json()).then((data: any) => {
            this.setState({
                lobbyList: data
            })
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

    link(text: string, path: string) {
        if (path.charAt(0) != "/") {
            path = "/" + path;
        }
        return (
            <div className="col-5 ">
                <h4>
                    <Link onClick={() => this.setState({ pathName: path })}
                        className={"link" + (this.state.pathName == path && " active")}
                        to={path}>{text}
                    </Link>
                </h4>
            </div>
        )
    }

    lobbies() {
        let rows: JSX.Element[] = [];
        this.state.lobbyList.forEach((lobby, index) => {
            rows.push(
                <div key={index} className="row align-items-center border-bottom border-green no-gutters" style={{ padding: '1vw' }}>
                    {this.link(lobby.name, `/lobby/${lobby.id}`)}
                    <div className="col-4"><h4>{lobby.leader}</h4></div>
                    <div className="col-1">{lobby.password == ""
                    ?
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-unlock-fill" viewBox="0 0 16 16">
                        <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                    }</div>
                    <div className="col-2"><input type="button" className="btn btn-success btn-block join-button" value="Join" style={{ marginRight: '0px' }} /></div>
                </div>
            );
        });

        return (
            <div className="container-lobby">
                <div className="row border-bottom border-green align-items-center no-gutters">
                    <div className="col-5"><h4>Lobby Name</h4></div>
                    <div className="col-4"><h4>Owner</h4></div>
                    <div className="col-1"></div>
                    <div className="col-2"><h4>Join</h4></div>
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
                    <button className="btn btn-success" style={{ margin: '20px 10px' }} onClick={this.addLobby}>Add Lobby</button>
                    {this.lobbies()}
                </div>
            </>
        )
    }
}
