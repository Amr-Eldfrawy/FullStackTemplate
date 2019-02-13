import React, { Component } from "react";
import {
    BrowserRouter as Router, Link, Route,
    Redirect
} from 'react-router-dom'
import {
    Alert
} from 'reactstrap'

import Dashboard from './dashboard'
import PMForm from './pmForm'
import NavigationBar from './navigation_bar'

import './App.css';
import { ApiHandler } from "./api_handler";

// take it is out class 
var JWT_TOKEN;
// take it to it's own clas 
const PrivateRoute = ({ component: Component, ...rest, authenticated, data }) => (
    <Route
        {...rest}
        render={props =>
            authenticated
                ? (<Component data={data} {...props} />)
                :
                (<Redirect to={{
                    pathname: '/',
                    state: { from: rest.path }
                }} Î />)
        }
    />
);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.dashboardData = null
        this.state = {
            authenticated: false,
            alertInfo: null
        }
        this.authenticate = this.authenticate.bind(this);
        this.signout = this.signout.bind(this);
        this.onAlertDismiss = this.onAlertDismiss.bind(this);
        this.register = this.register.bind(this);
    }

    async authenticate(username, password) {
        // make call using user usernme and password 
        // if succss register token and redirect to dashboard with all loaded data
        //  if falied alert thhat this is wrong credenitals 
        let callSigninResponse = await ApiHandler.callSignin(username, password)

        if (callSigninResponse.status) {
            JWT_TOKEN = callSigninResponse.jwt_token
            // maybe moved to dashboard 
            let callGetCredentialsResponse = await ApiHandler.callGetCredentials(callSigninResponse.jwt_token)

            if (callGetCredentialsResponse.status) {
                // this.dashboardData = callGetCredentialsResponse.dashboardData;
                this.setState({ authenticated: true });
            }

        } else {
            this.setState({ alertInfo: response.message })
        }

    }

    async signout() {
        await ApiHandler.callLogout(JWT_TOKEN)
        JWT_TOKEN = null
        this.setState({ authenticated: false });
    }

    async register(username, password) {
        let callRegisterCallResponse = await ApiHandler.callRegister(username, password)
        this.setState({ alertInfo: callRegisterCallResponse.message })
    }

    onAlertDismiss() {
        this.setState({ alertInfo: null });
    }

    render() {
        // clean this a little 
        return (
            <Router>
                <div>
                    <NavigationBar redirectToLogin={this.signout} authenticated={this.state.authenticated} />
                    <Alert color="info" isOpen={(!this.state.alertInfo) ? false : true} toggle={this.onAlertDismiss} fade={false}>
                        {this.state.alertInfo}
                    </Alert>


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

                    <PrivateRoute path='/dashboard' component={Dashboard} authenticated={this.state.authenticated} data={this.dashboardData} />

                </div>
            </Router>
        );
    }
}