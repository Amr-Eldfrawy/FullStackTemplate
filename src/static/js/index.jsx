import React from "react";
import ReactDOM from "react-dom";
import App from './App'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'

const Register = () => (
    <div>
      <h2>register</h2>
      ...
    </div>
  )

ReactDOM.render(
    <Router>
        <div>
            <aside>
                <Link to={'/'}> Sign In</Link>
                <Link to={'/register'}>Register</Link>
            </aside>


            <main>
                <Route exact path="/" component={App} />
                <Route path="/register" component={Register} />
            </main>
        </div>
    </Router>
    , document.getElementById("content"));
