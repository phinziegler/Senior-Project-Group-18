import React from "react";
import { Link, Navigate } from "react-router-dom";
import Environments from "../../shared/Environments";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { POST } from "../fetch";

interface LoginProps {
    setUser: (user: User) => void;
    user: User | null;
}

interface loginState {
    username: string;
    password: string;
    status: string | undefined;
    statusClass: string;
}

export default class Other extends React.Component<LoginProps, loginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            status: undefined,
            statusClass: "text-danger",
        }
        this.login = this.login.bind(this);
    }

    /**
     * makes the login request to the server
     */
    async login() {
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
                return res.json();
            }
            this.setState({ status: "Invalid username or password", statusClass: "text-danger" });
        }).then((data) => {
            if (!data) {
                return;
            }
            this.props.setUser(JSON.parse(data.user));
        });
    }

    render() {
        if (this.props.user) {
            if (this.props.user.username == undefined) {
                return;
            }
            return <Navigate replace to={`/user/${this.props.user.username}`} />
        }

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

                <span>No account? <Link to={"/create-account"}>Create one!</Link></span>
            </>
        )
    }
}
