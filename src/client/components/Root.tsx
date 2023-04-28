import React from "react";
import { NavigateFunction, Outlet } from "react-router-dom";
import Lobby from "../../shared/Lobby";
import User from "../../shared/User";
import HomeNavbar from "./HomeNavbar";

interface RootProps {
    user: User | null,
    lobby: Lobby | null
}

export default class Root extends React.Component<RootProps> {
    constructor(props: RootProps) {
        super(props);
    }
    render() {
        document.body.classList.add('body-css');
        return (
            <div className="main-font vh-100 vw-100" style={{ background: 'black' }}>
                <HomeNavbar lobby={this.props.lobby} user={this.props.user} />
                <div style={{ paddingTop: "56px" }}>
                    <Outlet />
                </div>
            </div>
        );
    }
}