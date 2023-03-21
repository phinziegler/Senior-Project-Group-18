import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { GET } from "../tools/fetch";
import ErrorPage from "./ErrorPage";
import requestUrl from "../tools/requestUrl";

interface UserPageProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

interface UserPageElementProps {
    username: string;
    user: User | null;
    setUser: (user: User | null) => void;
}

export default function UserPage(props: UserPageProps) {
    const params = useParams();
    if (!params.username) {
        return <ErrorPage />
    }
    return (
        <UserPageElement setUser={props.setUser} user={props.user} username={params.username} />
    );
}

interface UserPageElementState {
    signedOut: boolean;
}

class UserPageElement extends React.Component<UserPageElementProps, UserPageElementState> {
    constructor(props: UserPageElementProps) {
        super(props);
        this.getUser(props.username);
        this.state = {
            signedOut: false
        }
    }

    /* TODO: check if the user is logged in as the searched account, if they are, also return password information */
    async getUser(username: string) {
        if (!username) {
            return;
        }
        GET(requestUrl(ServerRoutes.USER(username))).then(res => res.json()).then((data: User) => {
            // TODO: Render more information on this page using the data from this GET request
        });
    }

    signOut() {
        window.localStorage.setItem('user', String());
        this.props.setUser(null);
        this.setState({ signedOut: true })
    }

    render() {
        return (
            <>
                {this.state.signedOut && <Navigate replace to="/login" />}
                {/* FIXME: This should not accquire the username from the props, it should only render a username once the getUser request is complete */}
                <h1>{this.props.username}</h1>  
                {this.props.user && (this.props.user.username == this.props.username) && <button onClick={() => this.signOut()}>Sign Out</button>}
            </>
        )
    }
}
