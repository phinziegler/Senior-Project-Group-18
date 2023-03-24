import React from "react";
import { NavigateFunction, Outlet } from "react-router-dom";
import Lobby from "../../shared/Lobby";
import User from "../../shared/User";
import SideBar from "../components/SideBar";

interface RootProps {
    user: User | null,
    lobby: Lobby | null
}

export default class Root extends React.Component<RootProps> {
    constructor(props: RootProps) {
        super(props);
    }
    render() {
        return (
            <div className="d-flex h-100 main-font" style={{ background: 'black' }}>
                <SideBar lobby={this.props.lobby} user={this.props.user} />
                <div className="w-100 h-100">
                    <Outlet />
                </div>
            </div>
        );
    }
}