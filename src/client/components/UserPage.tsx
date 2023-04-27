import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { DELETE_BODY, GET } from "../tools/fetch";
import ErrorPage from "./ErrorPage";
import requestUrl from "../tools/requestUrl";
import Lobby from "../../shared/Lobby";
import { getAuthToken } from "../tools/auth";


interface FriendProps {
    username: string,
    friendName: string,
    getFriends: (username: string) => void
}

interface FriendState {
    showDelete: boolean
}

class FriendDisplay extends React.Component<FriendProps, FriendState> {
    constructor(props: FriendProps) {
        super(props);
        this.state = {
            showDelete: false
        }
    }

    async removeFriend(username: string) {
        let data = {
            auth: getAuthToken(),
            target: username
        }
        await DELETE_BODY(requestUrl(ServerRoutes.REMOVE_FRIEND), data).then(() => {
            this.props.getFriends(this.props.username);
        });
    }

    render() {
        return (
            <div
                onMouseEnter={() => this.setState({ showDelete: true })}
                onMouseLeave={() => this.setState({ showDelete: false })}
                className="d-flex">
                <div className="me-3">{this.props.friendName}</div>
                {this.state.showDelete &&
                    <button title="Remove Friend" onClick={() => this.removeFriend(this.props.friendName)} className="text-danger btn-svg" style={{ backgroundColor: 'transparent' }}>
                        <svg className="glow-button-kick icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 122.879 122.879" enableBackground="new 0 0 122.879 122.879"><g><path fillRule="evenodd" clipRule="evenodd" fill="#FF4141" d="M61.44,0c33.933,0,61.439,27.507,61.439,61.439 s-27.506,61.439-61.439,61.439C27.507,122.879,0,95.372,0,61.439S27.507,0,61.44,0L61.44,0z M73.451,39.151 c2.75-2.793,7.221-2.805,9.986-0.027c2.764,2.776,2.775,7.292,0.027,10.083L71.4,61.445l12.076,12.249 c2.729,2.77,2.689,7.257-0.08,10.022c-2.773,2.765-7.23,2.758-9.955-0.013L61.446,71.54L49.428,83.728 c-2.75,2.793-7.22,2.805-9.986,0.027c-2.763-2.776-2.776-7.293-0.027-10.084L51.48,61.434L39.403,49.185 c-2.728-2.769-2.689-7.256,0.082-10.022c2.772-2.765,7.229-2.758,9.953,0.013l11.997,12.165L73.451,39.151L73.451,39.151z" /></g></svg>
                    </button>
                }
            </div>
        )
    }
}

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

        this.getFriends = this.getFriends.bind(this);
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
            if (!this.state.confirmedUsername) {
                return;
            }
            output.push(
                <FriendDisplay key={index} username={this.state.confirmedUsername} friendName={friend} getFriends={this.getFriends} />
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
