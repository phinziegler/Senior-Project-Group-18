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
    owner: boolean
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
                {/* USERNAME TEXT */}
                <span title={this.props.user?.username == this.props.username ? 'You' : ''} className={'h4 ' + (this.props.user?.username == this.props.username ? 'text-success' : '')}>{this.props.username}</span>
                
                {/* LOBBY OWNER INDICATOR */}
                {this.props.owner && <span className='ms-2' title="Lobby Owner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="lightgreen" className="bi bi-star icon" viewBox="0 0 16 16">
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                    </svg>
                </span>}
                {this.state.showExtra &&
                    <span className="ms-1">
                        {!this.state.isFriend
                            ?
                            // NOT FRIEND
                            <>
                                {this.state.status != "" && <span className="text-danger">{this.state.status}</span>}
                                {/* ADD FRIEND BUTTON */}
                                {this.props.user?.username != this.props.username && <button title="Add Friend" style={{ backgroundColor: 'transparent' }} onClick={() => this.addFriend()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-fill-add glow-button-friend icon" viewBox="0 0 16 16" style={{ margin: '0px 0px' }}>
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                    </svg>
                                </button>}
                            </>
                            :
                            // IS FRIEND
                            // FRIEND INDICATOR
                            <span className="text-success" title="Friend Added">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-fill-check icon" viewBox="0 0 16 16" style={{ margin: '0px 6px' }}>
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                </svg>
                            </span>}

                        {/* REMOVE USER BUTTON */}
                        {this.props.admin && this.props.user?.username != this.props.username && <button title="Kick From Lobby" onClick={() => this.props.removeUser(this.props.username)} className="text-danger btn-svg" style={{ backgroundColor: 'transparent' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person glow-button-kick icon" viewBox="0 -1 16 16">
                                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708Z" />
                            </svg>
                        </button>}
                    </span>
                }
            </div>
        </>);
    }
}