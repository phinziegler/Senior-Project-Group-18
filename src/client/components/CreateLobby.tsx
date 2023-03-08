import { request } from "http";
import React from "react";
import { Navigate } from "react-router-dom";
import AuthToken from "../../shared/AuthToken";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { getAuthToken } from "../auth";
import { POST } from "../fetch";
import requestUrl from "./requestUrl";

interface CreateLobbyState {
    lobbyName: string;   // the lobby name
    lobbyPassword: string;   // the lobby password
    reroute: boolean;
    lobbyId: string;
}

export default class CreateLobby extends React.Component<{}, CreateLobbyState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            lobbyName: "",
            lobbyPassword: "",
            reroute: false,
            lobbyId: "",
        }
    }

    createLobby(e: React.FormEvent) {
        e.preventDefault();
        let leader: AuthToken;
        try {
            leader = getAuthToken();
        } catch {
            console.error("Cannot create lobby, user is not logged in");
            return;
            // TODO: Display some kind of message to the user that they need to be logged in
            // Better yet, if the user is not logged in, it should simply redirect them to the home or login page
        }
        const data = {
            lobbyName: this.state.lobbyName,
            lobbyPassword: this.state.lobbyPassword,
            leader: leader
        }
        POST(requestUrl(ServerRoutes.MAKE_LOBBY), data).then(res => {
            if (res.status != 200) {
                console.error("Failed to create lobby");
                return;
            }
            return res.json();/* TODO: make this reroute to the newly created lobby page */
        }).then(e => {
            if (!e) {
                return;
            }
            try {
                this.setState({reroute: true, lobbyId: e.id});
            } catch (error: any) {
                console.error(`Something went wrong: ${error.message}`)
            }
        })
    }

    render() {
        const buttonDisabled = this.state.lobbyName == "";

        return <React.Fragment>
            {this.state.reroute && <Navigate replace to={`/lobby/${this.state.lobbyId}`} />}
            <div className='login-box'>
                <h1 style={{ margin: '1vh' }}>Create Lobby</h1>
                <form onSubmit={e => this.createLobby(e)}>
                    {/* LOBBY NAME */}
                    <div className="text-input">
                        <label htmlFor="lobby-name">Lobby Name:</label>
                        <div></div>
                        <input
                            onChange={(e) => this.setState({ lobbyName: e.target.value })}
                            value={this.state.lobbyName}
                            type="text"
                            required={true}
                        />
                    </div>

                    {/* LOBBY PASSWORD */}
                    <div className="text-input">
                        <label htmlFor="password">Password:</label>
                        <div></div>
                        <input
                            onChange={(e) => this.setState({ lobbyPassword: e.target.value })}
                            value={this.state.lobbyPassword}
                        />
                    </div>

                    {/* CREATE LOBBY */}
                    <div className="form-group">
                        <input
                            disabled={buttonDisabled}
                            value="Create Lobby"
                            className={(buttonDisabled ? "submit-button-disabled" : "submit-button")}
                            type="submit" />
                    </div>
                </form>
            </div>
        </React.Fragment>
    }
}
