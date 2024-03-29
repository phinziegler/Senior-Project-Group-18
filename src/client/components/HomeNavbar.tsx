
import React from 'react'
import { Link } from 'react-router-dom';
import Lobby from '../../shared/Lobby';
import User from '../../shared/User';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

interface HomeNavbarProps {
    user: User | null,
    lobby: Lobby | null
}

export default class HomeNavbar extends React.Component<HomeNavbarProps, { pathName: string }> {

    constructor(props: HomeNavbarProps) {
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
            <Navbar fixed="top" bg="secondary" expand="lg" variant="dark" style={{ padding: '.5rem 1.5rem' }} id="sidebar">
                <Navbar.Brand className="me-3">{this.link("Tricks of the Trade", "/")}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav variant="pills">
                        {this.props.user ? this.link(this.props.user.username, `user/${this.props.user.username}`) : this.link("Login", "login")}
                        {this.link("Lobbies", "/lobby-list")}
                        {this.props.lobby && this.link(this.props.lobby.name, `lobby/${this.props.lobby.id}`)}
                        {this.link("Game", "/game")}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}