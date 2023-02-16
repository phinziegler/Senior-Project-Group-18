import React from 'react';                      // this is imported for every react component
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import User from '../../shared/User';
import { get } from '../fetch';

interface state {
  users: User[]
}

export default class Other extends React.Component<{}, state> {
  myClassVariable: number;  // class variables have to be 'announced' like so

  constructor(props: {}) {
    super(props);
    this.myClassVariable = 0;
    this.state = {
      users: []
    }
    this.fetchUsers = this.fetchUsers.bind(this)
  }

  fetchUsers() {
    const loc = process.env.NODE_ENV == 'production' ? window.location.protocol + "//" + window.location.host + "/users" : "http://localhost:8000/users";
    get(loc)
      .then((users: User[]) => this.setState({ users: users }));
  }

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
        <h1 className='text-center text-white'>Example</h1>
        <button className={"btn " + (isPopulated ? "btn-secondary" : 'btn-success')} disabled={isPopulated} onClick={this.fetchUsers}>Click here to see users!</button>
        {this.users()}
      </div>
    );
  }
}