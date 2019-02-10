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
    Collapse
} from 'reactstrap'

import Dashboard from './dashboard'
import PMForm from './pmForm'

import './App.css';

// todo handle that UI 
let SignOut = withRouter(({ history, signout }) => {
    return (
        <NavItem>
            <NavLink onClick={() => { signout(() => history.push('/login')) }}> LogOut </NavLink>
        </NavItem>
    );

})

const PrivateRoute = ({ component: Component, ...rest, authenticated }) => (
    <Route
        {...rest}
        render={props =>
            authenticated
                ? (<Component {...props} />)
                :
                (<Redirect to={{
                    pathname: '/login',
                    state: { from: rest.path }
                }} Î />)
        }
    />
);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jwt_token: null,
            authenticated: false
        }
        this.authenticate = this.authenticate.bind(this);
        this.signout = this.signout.bind(this);
    }

    authenticate(f) {
        this.setState({ authenticated: true });
        setTimeout(f, 100);
    }

    signout(f) {
        this.setState({ authenticated: false });
        setTimeout(f, 100);
    }

    render() {
        let pmNavBar =
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink> <Link to={'/login'}> Sign In</Link></NavLink>
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
                        <Route path="/login" component={(props) => {
                            if (this.state.authenticated) {
                                return (<Redirect to='/dashboard' />);
                            } else {
                                return (<PMForm authenticate={this.authenticate} {...props} header={<h2>Login</h2>} />)
                            }
                        }} />
                        <Route path="/register" component={(props) => {
                            if (this.state.authenticated) {
                                return (<Redirect to='/dashboard' />);
                            } else {
                                return (<PMForm authenticate={this.authenticate} {...props} header={<h2>Register</h2>} />)
                            }
                        }} />
                        <PrivateRoute path='/dashboard' component={Dashboard} authenticated={this.state.authenticated} />
                    </main>
                </div>
            </Router>
        );
    }
}