import React, { Component } from "react";
import {
    BrowserRouter as Router, Link, Route,
    Redirect
} from 'react-router-dom'
import Dashboard from './dashboard'
import PMForm from './pmForm'
import NavigationBar from './navigation_bar'

import './App.css';
import { ApiHandler } from "./api_handler";

// take it is out class 
var JWT_TOKEN;
// take it to it's own clas 
const PrivateRoute = ({ component: Component, ...rest, authenticated }) => (
    <Route
        {...rest}
        render={props =>
            authenticated
                ? (<Component jwt_token={JWT_TOKEN} {...props} />)
                :
                (<Redirect to={{
                    pathname: '/',
                    state: { from: rest.path }
                }}/>)
        }
    />
);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.dashboardData = null
        this.state = {
            authenticated: false,
        }
        this.authenticate = this.authenticate.bind(this);
        this.signout = this.signout.bind(this);
        this.register = this.register.bind(this);
    }

    async authenticate(username, password) {
        let callSigninResponse = await ApiHandler.callSignin(username, password)

        if (callSigninResponse.status) {
            JWT_TOKEN = callSigninResponse.jwt_token
            this.setState({ authenticated: true });
        } else {
            alert(callSigninResponse.message);
        }

    }

    async signout() {
        await ApiHandler.callLogout(JWT_TOKEN)
        JWT_TOKEN = null
        this.setState({ authenticated: false });
    }

    async register(username, password) {
        let callRegisterCallResponse = await ApiHandler.callRegister(username, password)
        confirm(callRegisterCallResponse.message);
    }

    render() {
        return (
            <Router>
                <div>
                    <NavigationBar redirectToLogin={this.signout} authenticated={this.state.authenticated} />
                    <Route exact path="/" component={(props) => {
                        if (this.state.authenticated) {
                            return (<Redirect to='/dashboard' />);
                        } else {
                            return (<PMForm authFn={this.authenticate} {...props} header={<h2>Login</h2>} />)
                        }
                    }} />

                    <Route path="/register" component={(props) => {
                        if (this.state.authenticated) {
                            return (<Redirect to='/dashboard' />);
                        } else {
                            return (<PMForm authFn={this.register} {...props} header={<h2>Register</h2>} />)
                        }
                    }} />

                    <PrivateRoute path='/dashboard' component={Dashboard} authenticated={this.state.authenticated}/>
                </div>
            </Router>
        );
    }
}