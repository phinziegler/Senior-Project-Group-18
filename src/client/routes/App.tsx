import React from 'react';                      // this is imported for every react component
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported

export default class App extends React.Component {
  myClassVariable: number;  // class variables have to be 'announced' like so

  constructor(props: {}) {
    super(props);
    this.myClassVariable = 0;
  }

  render() {
    return (
      <div className='bg-dark'>
        <h1 className='text-center text-white'>Example</h1>
      </div>
    );
  }
}