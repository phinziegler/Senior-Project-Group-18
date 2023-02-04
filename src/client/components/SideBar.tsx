
import React from 'react'
import { Link } from 'react-router-dom';

export default class SideBar extends React.Component<{}, { pathName: string }> {

    constructor(props: {}) {
        super(props);
        this.state = {
            pathName: window.location.pathname
        }
    }
    link(text: string, path: string) {
        if (path.charAt(0) != "/") {
            path = "/" + path;
        }
        return (
            <li className="nav-item">
                <Link onClick={() => this.setState({ pathName: path })} className={"sidebar-item nav-link text-decoration-none" + (this.state.pathName == path && " active")} to={path}>{text}</Link>
            </li>
        )
    }

    render() {
        return (
            <nav className="vh-100 px-3 d-flex flex-column flex-shrink-0 text-white bg-dark" id="sidebar">
                <h1>SideBar</h1>
                <ul className="nav nav-pills flex-column mb-auto list-group">
                    {this.link("home", "/")}
                    {this.link("other", "other")}
                    {this.link("this will error", "/error")}
                </ul>
                <hr />
            </nav>
        );
    }
}