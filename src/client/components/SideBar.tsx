
import React from 'react'
import { Link } from 'react-router-dom';
import Environments from '../../shared/Environments';
import User from '../../shared/User';

interface SideBarProps {
    user: User | null
}

export default class SideBar extends React.Component<SideBarProps, { pathName: string }> {

    constructor(props: SideBarProps) {
        super(props);
        this.state = {
            pathName: window.location.pathname
        }
    }

    /**
     * Create a link object for the sidebar
     * @param text the text displayed for this link
     * @param path the path this link leads to
     */
    link(text: string, path: string) {
        if (path.charAt(0) != "/") {
            path = "/" + path;
        }
        return (
            <li className="nav-item">
                <Link onClick={() => this.setState({ pathName: path })}
                    className={"sidebar-item nav-link text-decoration-none" + (this.state.pathName == path && " active")}
                    to={path}>{text}
                </Link>
            </li>
        )
    }

    render() {
        return (
            <nav className="vh-100 px-3 d-flex flex-column flex-shrink-0 text-white bg-dark" id="sidebar">
                <h1>Tricks of the Trade</h1>
                <ul className="nav nav-pills flex-column mb-auto list-group">
                    {this.link("home", "/")}
                    {process.env.NODE_ENV == Environments.DEVELOPMENT && this.link("admin", "admin")}   {/* TODO: This should be entirely removed eventually*/}
                    {this.props.user ? this.link(`${this.props.user.username}`, `user/${this.props.user.username}`) : this.link("login", "login")}
                    {this.props.user &&  this.link("create lobby", "create-lobby")}
                    {this.link("lobby list", "/lobby-list")}
                    {this.link("this will error", "/error")}
                </ul>
                <hr />
            </nav>
        );
    }
}