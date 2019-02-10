import React, { Component } from "react";
import {
    BrowserRouter as Router, Link, Route,
    Redirect, withRouter
} from 'react-router-dom'
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Collapse,
    Alert
} from 'reactstrap'

import Dashboard from './dashboard'
import PMForm from './pmForm'

import './App.css';
import { ApiHandler } from "./api_handler";

// take it is out class 
let SignOut = withRouter(({ history, signout }) => {
    return (
        <NavItem>
            <NavLink onClick={() => { signout(() => history.push('/')) }}> LogOut </NavLink>
        </NavItem>
    );

})
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
            jwt_token: null,
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
            let callGetCredentialsResponse = await ApiHandler.callGetCredentials(callSigninResponse.jwt_token)

            if (callGetCredentialsResponse.status) {
                // this.dashboardData = callGetCredentialsResponse.dashboardData;
                this.setState({ authenticated: true });
            }

        } else {
            this.setState({ alertInfo: response.message })
        }

    }

    signout() {
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
        let pmNavBar =
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink> <Link to={'/'}> Sign In</Link></NavLink>
                </NavItem>

                <NavItem>
                    <NavLink>  <Link to={'/register'}>Register</Link></NavLink>
                </NavItem>
            </Nav >

        if (this.state.authenticated) {
            pmNavBar =
                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink> <Link to={'/dashboard'}>Dashboard</Link></NavLink>
                    </NavItem>

                    <SignOut signout={this.signout} />
                </Nav >
        }
        return (
            <Router>
                <div>
                    <Navbar color="light" light expand="md">
                        <NavbarBrand> HU Password Manager</NavbarBrand>
                        <Collapse navbar>
                            {pmNavBar}
                        </Collapse>
                    </Navbar>

                    <main>
                        <Alert color="info" isOpen={(!this.state.alertInfo) ? false : true} toggle={this.onAlertDismiss} fade={false}>
                            {this.state.alertInfo}
                        </Alert>
                        {/* clean this a litte */}

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
                    </main>
                </div>
            </Router>
        );
    }
}