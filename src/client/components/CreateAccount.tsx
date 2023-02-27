import React from "react";
import { Navigate } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import { POST } from "../fetch";
import requestUrl from "./requestUrl";

interface CreateAccountState {
    username: string;   // the username 
    password: string;   // the password
    confirm: string;    // the password confirmation
    usernameTaken: boolean;     // username taken status
    created: boolean;           // whether the account was created or not
}

// The create account page
export default class CreateAccount extends React.Component<{}, CreateAccountState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            username: "",
            password: "",
            confirm: "",
            usernameTaken: false,
            created: false
        }
        this.newAccount = this.newAccount.bind(this);
    }

    async newAccount(e: React.FormEvent) {
        e.preventDefault();
        if (this.state.confirm != this.state.password) {
            console.log("Passwords do not match");
        }

        POST(requestUrl(ServerRoutes.ADD_USER), { username: this.state.username, password: this.state.password })
            .then(res => {
                if (res.status == 200) {
                    this.setState({ created: true });
                    return;
                }
                console.log("Duplicate username");
                this.setState({ usernameTaken: true });
            });
    }

    render() {
        if (this.state.created) {
            return <Navigate replace to="/login" />;
        }
        const buttonDisabled = this.state.password != this.state.confirm || this.state.password == "" || this.state.username == "";
        const passwordRegex = "^(?=.*.)(?=.*\\d).{8,}$";
        return <React.Fragment>
            <h3>CreateAccount</h3>
            <form onSubmit={this.newAccount}>
                {/* USERNAME */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="text-muted small">Less than 20 letters and numbers.</div>
                    <input
                        pattern="^[\d\w]{1,20}$"                            // only letters and numbers, between 1 and 20 characters long
                        onChange={(e) => this.setState({ username: e.target.value })}
                        value={this.state.username}
                        className={`form-control ${this.state.usernameTaken ? "is-invalid" : ""}`}
                        id="username"
                        required={true}
                        type="text" />
                    {this.state.usernameTaken && <span className="text-danger small">This username has already been taken!</span>}
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                    <label htmlFor="password">Password
                        <div className="text-muted small">Please include at least one number, 8 letters minimum.</div>
                    </label>

                    <input
                        pattern={passwordRegex}    // Minimum eight characters, at least one letter and one number: https://stackoverflow.com/a/21456918
                        onChange={(e) => this.setState({ password: e.target.value })}
                        value={this.state.password}
                        className="form-control"
                        id="password"
                        required={true}
                        type="password" />
                </div>

                {/* CONFIRM */}
                <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        pattern={passwordRegex}
                        onChange={(e) => this.setState({ confirm: e.target.value })}
                        value={this.state.confirm}
                        className="form-control"
                        id="confirm-password"
                        required={true}
                        type="password" />
                </div>

                {/* SUBMIT */}
                <div className="form-group">
                    <input
                        disabled={buttonDisabled}
                        value="Create Account"
                        className={"btn " + (buttonDisabled ? "btn-secondary" : "btn-primary")}
                        type="submit" />
                </div>
            </form>
        </React.Fragment>
    }
}
