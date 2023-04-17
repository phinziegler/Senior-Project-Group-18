
import React from 'react'
import { Link } from 'react-router-dom';
import Environments from '../../shared/Environments';
import Lobby from '../../shared/Lobby';
import User from '../../shared/User';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

interface SideBarProps {
    user: User | null,
    lobby: Lobby | null
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
            <Link onClick={() => this.setState({ pathName: path })}
                className={"nav-item nav-link text-decoration-none text-white " + (this.state.pathName == path && "active")}
                to={path}>{text}
            </Link>
        )
    }

    render() {
        return (
            <Navbar bg="secondary" expand="lg" variant="dark" style={{ padding: '.5rem 1.5rem' }} id="sidebar">
                <Navbar.Brand className="me-3">{this.link("Tricks of the Trade", "/")}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav variant="pills">
                        {process.env.NODE_ENV == Environments.DEVELOPMENT && this.link("admin", "admin")}   {/* TODO: This should be entirely removed eventually*/}
                        {this.props.user ? this.link('user', `user/${this.props.user.username}`) : this.link("login", "login")}
                        {this.props.user && this.link("create lobby", "create-lobby")}
                        {this.link("lobby list", "/lobby-list")}
                        {this.props.lobby && this.link(this.props.lobby.name, `lobby/${this.props.lobby.id}`)}
                        {this.link("this will error", "/error")}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}