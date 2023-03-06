import { request } from "http";
import React from "react";
import { Navigate } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { POST } from "../fetch";
import requestUrl from "./requestUrl";

interface CreateLobbyState {
    lobbyName: string;   // the lobby name
    lobbyPassword: string;   // the lobby password
}

export default class CreateLobby extends React.Component<{}, CreateLobbyState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            lobbyName: "",
            lobbyPassword: "",
        }
    }

    createLobby(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            lobbyName: this.state.lobbyName,
            lobbyPassword: this.state.lobbyPassword,
        }
        POST(requestUrl(ServerRoutes.MAKE_LOBBY), data).then(res => {
            if (res.status != 200) {
                console.log("Failed to create lobby");
                return;
            }
            /* TODO: make this reroute to the newly created lobby page */
        })
    }

    render() {

        const buttonDisabled = this.state.lobbyName == "";

        return <React.Fragment>
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
