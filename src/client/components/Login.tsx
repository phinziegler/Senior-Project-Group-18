import React from "react";
import { Link, Navigate } from "react-router-dom";
import User from "../../shared/User";
import '../styles/style.css';
import { login } from "../tools/auth";

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
        await login(this.state.username, this.state.password).then(data => {
            if (!data) {
                this.setState({ status: "Invalid username or password", statusClass: "text-danger" });
                return;
            }
            this.setState({ status: "Success", statusClass: "text-success" });
            this.props.setUser(data);
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
                <div className='login-box'>
                    <h1 style={{margin: '1vh'}}>Login</h1>
                    <form onSubmit={(event) => {
                        event.preventDefault();     // the page reloads by default when you press submit, but this behavior is not desired
                        this.login();
                    }}>
                        {this.state.status && <p className={this.state.statusClass}>{this.state.status}</p>}

                        <div className='text-input'>
                            <label htmlFor="username">username:&nbsp;</label>
                            <input value={this.state.username} onChange={(e) => this.setState({ username: e.target.value })} id="username" type="text" />
                        </div>
                        <div className='text-input'>
                            <label htmlFor="password">password:&nbsp;</label>
                            <input value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} id="password" type="password" />
                        </div>
                        <div><button className='submit-button' type="submit">Sign In</button></div>
                    </form>

                    <div style={{'marginBottom': '1vh'}}>No account? <Link to={"/create-account"}>Create one!</Link></div>
                </div>
            </>
        )
    }
}
