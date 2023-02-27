import React from "react";
import { NavigateFunction, Outlet } from "react-router-dom";
import User from "../../shared/User";
import SideBar from "../components/SideBar";

interface RootProps {
    user: User | null
}

export default class Root extends React.Component<RootProps> {
    constructor(props: RootProps) {
        super(props);
    }
    render() {
        return (
            <div className="d-flex h-100" >
                <SideBar user={this.props.user} />
                <div className="w-100 h-100">
                    <Outlet />
                </div>
            </div>
        );
    }
}