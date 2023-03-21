import React from 'react';                      // this is imported for every react component
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import User from '../../shared/User';
import { GET, POST } from '../tools/fetch';
import Environments from '../../shared/Environments';
import ServerRoutes from '../../shared/ServerRoutes';

interface state {
  users: User[]
}

export default class AdminPage extends React.Component<{}, state> {
  myClassVariable: number;  // class variables have to be 'announced' like so

  constructor(props: {}) {
    super(props);
    this.myClassVariable = 0;
    this.state = {
      users: []
    }
    this.fetchUsers = this.fetchUsers.bind(this);
    this.addUser = this.addUser.bind(this);
  }

  /** 
    makes an add user request to the server. TODO: this functionality should be moved to a "create account" page/element
   * */
  addUser() {
    const loc = process.env.NODE_ENV == Environments.PRODUCTION
      ? window.location.protocol + "//" + window.location.host + ServerRoutes.ADD_USER
      : "http://localhost:8000" + ServerRoutes.ADD_USER;
    POST(loc, { username: "CLIENT_USERNAME_" + Math.random(), password: "CLIENT_PASSWORD" })
      .then((res) => {
        res.json().then(obj => console.log(obj.message));
        this.fetchUsers();
      });
  }

  /**
   * Gets a list of all users from the server. TODO: This was made to serve as an example of making requests to the server, 
   * but since this exposes passwords and salt it should certainly be removed.
   */
  fetchUsers() {
    const loc = process.env.NODE_ENV == Environments.PRODUCTION
      ? window.location.protocol + "//" + window.location.host + ServerRoutes.SHOW_USERS
      : "http://localhost:8000" + ServerRoutes.SHOW_USERS;
    GET(loc)
      .then(res => res.json())
      .then((users: User[]) => this.setState({ users: users }));
  }

  /**
   * Creates a table with user information
   * @returns the user table element
   */
  users() {
    let rows: JSX.Element[] = [];
    this.state.users.forEach(user => {
      rows.push(
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.username}</td>
          <td>{user.salt}</td>
          <td>{user.password}</td>
        </tr>
      );
    });

    return (
      <table className="table table-light table-striped">
        <thead className='table-dark'>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Username</th>
            <th scope="col">Salt</th>
            <th scope="col">Password</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  render() {
    let isPopulated = this.state.users.length > 0;
    return (
      <div className='bg-dark'>
        <h1 className='text-center text-white'>Admin Page</h1>
        <button className={"btn " + (isPopulated ? "btn-secondary" : 'btn-success')} disabled={isPopulated} onClick={this.fetchUsers}>Click here to see users!</button>
        <button className="btn btn-success" onClick={this.addUser}>Add User</button>
        {this.users()}
      </div>
    );
  }
}