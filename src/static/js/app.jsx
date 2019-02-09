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

import {AuthenticationService} from './auth'
import Dashboard from './dashboard'
import PMForm from './pmForm'

import './App.css';

// todo handle that UI 
let AuthButton = withRouter(({ history }) => {
    return (
        AuthenticationService.authenticated === true
            ? (<p>
                welcome ! <button onClick={() => { AuthenticationService.signout(() => history.push('/')) }}> Sign out </button>
            </p>) :
            (<p> your are not loged in </p>));
})

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            AuthenticationService.authenticated
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
            jwt_token: null
        }
    }

    render() {
        return (
            <Router>
                <div>
                    <Navbar color="light" light expand="md">
                        <NavbarBrand> HU Password Manager</NavbarBrand>

                        <Collapse navbar>
                            <Nav className="ml-auto" navbar>
                                <NavItem>
                                    <NavLink> <Link to={'/login'}> Sign In</Link></NavLink>
                                </NavItem>

                                <NavItem>
                                    <NavLink>  <Link to={'/register'}>Register</Link></NavLink>
                                </NavItem>

                                <NavItem>
                                    <NavLink> <Link to={'/dashboard'}>Dashboard</Link></NavLink>
                                </NavItem>

                            </Nav>
                        </Collapse>
                    </Navbar>

                    <AuthButton />
                    <main>
                        <Route path="/login" component={(props) => {
                            if (AuthenticationService.authenticated) {
                                return (<Redirect to='/dashboard'/>);
                            } else {
                                return (<PMForm {...props} header={<h2>Login</h2>} />)
                            }
                        }} />
                         <Route path="/register" component={(props) => {
                            if (AuthenticationService.authenticated) {
                                return (<Redirect to='/dashboard'/>);
                            } else {
                                return (<PMForm {...props} header={<h2>Register</h2>} />)
                            }
                        }} />
                        <PrivateRoute path='/dashboard' component={Dashboard} />
                    </main>
                </div>
            </Router>
        );
    }
}