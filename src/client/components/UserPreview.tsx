import React from "react";
import ServerRoutes from "../../shared/ServerRoutes";
import User from "../../shared/User";
import { getAuthToken } from "../tools/auth";
import { GET, POST } from "../tools/fetch";
import requestUrl from "../tools/requestUrl";

interface UserPreviewProps {
    user: User | null
    username: string
    admin: boolean
    removeUser: (username: string) => void
}

interface UserPreviewState {
    showExtra: boolean,
    isFriend: boolean,
    status: string
}

export default class UserPreview extends React.Component<UserPreviewProps, UserPreviewState> {
    constructor(props: UserPreviewProps) {
        super(props);
        this.state = {
            showExtra: false,
            isFriend: false,
            status: ""
        }
        this.isFriend = this.isFriend.bind(this);
    }

    componentDidMount(): void {
        this.isFriend();
    }

    async addFriend() {
        let data = {
            auth: getAuthToken(),
            target: this.props.username
        }
        await POST(requestUrl(ServerRoutes.ADD_FRIEND), data).then(res => {
            if (!(res.status == 200)) {
                this.setState({ status: "Failed to add friend" });
                return;
            }
            this.setState({ status: "", isFriend: true });
        });
    }

    async isFriend() {
        if (!this.props.user) {
            return;
        }
        await GET(requestUrl(ServerRoutes.IS_FRIEND(this.props.user.username, this.props.username))).then(res => res.json()).then(data => {
            this.setState({ isFriend: data.friends });
        });
    }

    render() {
        return (<>
            <div
                onMouseEnter={() => this.setState({ showExtra: true })}
                onMouseLeave={() => this.setState({ showExtra: false })}>
                <span>{this.props.username}</span>
                {this.state.showExtra &&
                    <span className="ms-3">
                        {!this.state.isFriend
                            ?
                            <>
                                {this.state.status != "" && <span className="text-danger">{this.state.status}</span>}
                                {this.props.user?.username == this.props.username
                                    ?
                                    <span className="text-success">{"you"}</span>
                                    :
                                    <span>
                                        <button className="btn btn-sm btn-primary" onClick={() => this.addFriend()}>Add Friend</button>
                                        {this.props.admin && <button onClick={() => this.props.removeUser(this.props.username)} className="btn btn-danger btn-sm">Remove User</button>}
                                    </span>}
                            </>
                            :
                            <span>
                                <span className="text-success">{"friend"}</span>
                                {this.props.admin && <button onClick={() => this.props.removeUser(this.props.username)} className="btn btn-danger btn-sm">Remove User</button>}
                            </span>}
                    </span>
                }
            </div>
        </>);
    }
}