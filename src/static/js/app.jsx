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

import {
    Col, Form,
    FormGroup, Label, Input,
    Button,
} from 'reactstrap';

import './App.css';
import Dashboard from './dashboard'

// like a class
const fakeAuth = {
    authenticated: false,
    authenticate(f) {
        this.authenticated = true;
        setTimeout(f, 100);
    },
    signout(f) {
        this.authenticated = false;
        setTimeout(f, 100);
    }
}

let AuthButton = withRouter(({ history }) => {
    return (
        fakeAuth.authenticated === true
            ? (<p>
                welcome ! <button onClick={() => { fakeAuth.signout(() => history.push('/')) }}> Sign out </button>
            </p>) :
            (<p> your are not loged in </p>));
})

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            fakeAuth.authenticated
                ? (<Component {...props} />)
                :
                (<Redirect to={{
                    pathname: '/login',
                    state: { from: rest.path }
                }} Î />)
        }
    />
);

// const PublicRoute = ({ component: Component, ...rest }) => (
//     <Route
//         {...rest}
//         render={props =>
//             fakeAuth.authenticated
//                 ? (<Dashboard {...props} />)
//                 :
//                 (<Redirect to={{
//                     pathname: '/login',
//                     state: { from: rest.path }
//                 }} Î />)
//         }
//     />
// );

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jwt_token: null
        }
    }

    // AuthenticatedRoute({ component: Component, authenticated, ...props}) {
    //     return (
    //         <Route
    //             {...pros}
    //             render={
    //                 (props) =>
    //                     authenticated
    //                         ? <Component {...props} />
    //                         : <Redirect to='/register' />} 
    //         />
    //     )
    // }

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
                            if (fakeAuth.authenticated) {
                                return (<Redirect to='/dashboard'/>);
                            } else {
                                return (<PMForm {...props} header={<h2>Login</h2>} />)
                            }
                        }} />
                         <Route path="/register" component={(props) => {
                            if (fakeAuth.authenticated) {
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
// class authHanlder extends React.Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             redirectToReferrer: false
//         }
//         this.login = this.login.bind(this);
//     }


//     login() {
//         fakeAuth.authenticate(() => {
//             this.setState({ redirectToReferrer: true })
//         })
//     }

//     render() {
//         const redirectToReferrer = this.state.redirectToReferrer
//         const from = this.props.location.state && this.props.location.state.from ? this.props.location.state.from : '/'
//         if (redirectToReferrer === true) {
//             return (
//                 <Redirect to={from} />
//             );
//         }

//         return (
//             <div>
//                 <p> you must login to view this page {from}</p>
//                 <button onClick={this.login}> Log In </button>
//             </div>
//         );
//     }
// }


class PMForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validUserName: true,
            validPassword: true,
            redirectToReferrer: false,
        }
        this.login = this.login.bind(this);
    }

    login() {
        fakeAuth.authenticate(() => {
            this.setState({ redirectToReferrer: true })
        })
    }


    validateUserName(e) {
        const userName = e.target.value;

        console.log(userName.length)
        if (!userName || userName.length == 0 || userName.length < 5) {
            this.setState({ validUserName: false });
            return
        }

        // should only contains alphanumeric characters
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        this.setState({ validUserName: usernameRegex.test(userName) });
    }

    validatePassword(e) {
        const password = e.target.value;

        if (!password || password.length == 0) {
            this.setState({ validPassword: false });
        }

        // https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        // The string must contain at least 1 numeric character, 1 uppercase character, one special character
        // , alphabetical character and eight characters or longer
        const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        this.setState({ validPassword: passwordRegex.test(password) });
    }

    render() {

        const redirectToReferrer = this.state.redirectToReferrer
        const from = this.props.location.state && this.props.location.state.from ? this.props.location.state.from : '/'
        console.log(from)
        if (redirectToReferrer === true) {
            return (
                <Redirect to={from} />
            );
        }

        return (

            <Form className="Form">
                {this.props.header}
                <Col>
                    <FormGroup>
                        <Label>Username</Label>
                        <Input
                            type="email"
                            id="userNameInput"
                            placeholder="my user name"
                            onChange={e => {
                                this.validateUserName(e)
                            }}
                            invalid={!this.state.validUserName}
                        />
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label for="examplePassword">Password</Label>
                        <Input
                            type="password"
                            id="passwordInput"
                            placeholder="my password"
                            onChange={e => {
                                this.validatePassword(e)
                            }}
                            invalid={!this.state.validPassword}
                        />
                    </FormGroup>
                </Col>
                <Button onClick={this.login}>Submit</Button>
            </Form>
        );
    }
}