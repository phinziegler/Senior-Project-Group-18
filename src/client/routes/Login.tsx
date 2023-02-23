import React from "react";
import Environments from "../../shared/Environments";
import ServerRoutes from "../../shared/ServerRoutes";
import { POST } from "../fetch";

interface loginState {
    username: string;
    password: string;
    status: string | undefined;
    statusClass: string;
}

export default class Other extends React.Component<{}, loginState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            username: "",
            password: "",
            status: undefined,
            statusClass: "text-danger"
        }
    }

    /**
     * makes the login request to the server
     */
    login() {
        const loc = process.env.NODE_ENV == Environments.PRODUCTION
            ? window.location.protocol + "//" + window.location.host + ServerRoutes.LOGIN
            : "http://localhost:8000" + ServerRoutes.LOGIN;

        let data = {
            username: this.state.username,
            password: this.state.password
        }

        POST(loc, data).then(res => {
            if (res.status == 200) {
                this.setState({ status: "Success", statusClass: "text-success" });
                return;
            }
            this.setState({ status: "Invalid username or password", statusClass: "text-danger" });
        });
    }

    render() {
        return (
            <>
                <h1>Login</h1>
                <form onSubmit={(event) => {
                    event.preventDefault();     // the page reloads by default when you press submit, but this behavior is not desired
                    this.login();
                }}>
                    {this.state.status && <p className={this.state.statusClass}>{this.state.status}</p>}

                    <label htmlFor="username">username</label>
                    <input value={this.state.username} onChange={(e) => this.setState({ username: e.target.value })} id="username" type="text" />

                    <label htmlFor="password">password</label>
                    <input value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} id="password" type="password" />

                    <button type="submit">Submit</button>
                </form>
            </>
        )
    }
}
