import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { GET } from "../tools/fetch";
import ErrorPage from "./ErrorPage";
import requestUrl from "../tools/requestUrl";
import Lobby from "../../shared/Lobby";

interface UserPageProps {
    user: User | null;
    setUser: (user: User | null) => void;
    setLobby: (lobby: Lobby | null) => void;
}

interface UserPageElementProps {
    username: string;
    user: User | null;
    setUser: (user: User | null) => void;
    setLobby: (lobby: Lobby | null) => void;
}

export default function UserPage(props: UserPageProps) {
    const params = useParams();
    if (!params.username) {
        return <ErrorPage />
    }
    return (
        <UserPageElement setLobby={props.setLobby} setUser={props.setUser} user={props.user} username={params.username} />
    );
}

interface UserPageElementState {
    signedOut: boolean;
    confirmedUsername: string | null;
    friends: string[]
}

class UserPageElement extends React.Component<UserPageElementProps, UserPageElementState> {
    constructor(props: UserPageElementProps) {
        super(props);
        this.state = {
            signedOut: false,
            confirmedUsername: null,
            friends: []
        }
    }

    // Validate user exists
    componentDidMount(): void {
        this.getUser(this.props.username);
    }

    async getUser(username: string) {
        if (!username) {
            return;
        }
        await GET(requestUrl(ServerRoutes.USER(username)))
            .then(res => {
                if (res.status != 200) {
                    return null;
                }
                return res.json();
            })
            .then((data: User) => {
                if (!data) {
                    this.setState({
                        confirmedUsername: null
                    });
                    return;
                }
                this.setState({
                    confirmedUsername: data.username
                });
                return data.username;
            })
            .then((username) => {
                if (!username) {
                    return;
                }
                this.getFriends(username);
            })
    }

    signOut() {
        window.localStorage.setItem('user', String());
        this.props.setUser(null);
        this.props.setLobby(null);
        this.setState({ signedOut: true })
    }

    friends() {
        let output: JSX.Element[] = [];

        this.state.friends.forEach((friend, index) => {
            output.push(
                <div key={index}>{friend}</div>
            );
        });

        return output;
    }

    async getFriends(username: string) {
        await GET(requestUrl(ServerRoutes.GET_FRIENDS(username)))
            .then(res => {
                if (res.status != 200) {
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (!data) {
                    return;
                }
                this.setState({
                    friends: data
                });
            });
    }

    render() {
        if (this.state.confirmedUsername == null) {
            return (
                <div className="text-danger container-sm p-3 my-3 border border-success rounded text-center">
                    <div>{`Profile '${this.props.username}' not found`}</div>
                </div>
            )
        }

        return (
            <>
                <div className="container-sm p-3 my-3 border border-success rounded">
                    {this.state.signedOut && <Navigate replace to="/login" />}
                    <h1>{this.state.confirmedUsername}</h1>
                    {this.props.user && (this.props.user.username == this.props.username) && <button className="btn btn-danger" onClick={() => this.signOut()}>Sign Out</button>}
                    <hr />
                    <h2>Friends</h2>
                    {this.state.friends.length > 0 ? <div className="p-3">
                        {this.friends()}
                    </div> : <div className="text-muted">No friends added</div>}
                </div>
            </>
        )
    }
}
