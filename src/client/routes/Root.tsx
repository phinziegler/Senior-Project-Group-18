import React from "react";
import { NavigateFunction, Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";

export default class Root extends React.Component<{nav?: NavigateFunction}> {
    constructor(props: {nav?: NavigateFunction}) {
        super(props);
    }
    render() {
        return (
            <div className="d-flex" >
                <SideBar />
                <div className="w-100">
                    <Outlet />
                </div>
            </div>
        );
    }
}