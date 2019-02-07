import React from "react";

import {
    Container, Col, Form,
    FormGroup, Label, Input,
    Button,
} from 'reactstrap';

export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validUserName: true,
            validPassword: true,
        }
    }


    validateUserName(e) {
        const userName = e.target.value;
        
        console.log(userName.length)
        if(!userName || userName.length == 0 || userName.length < 5) {
            this.setState({validUserName: false});
            return
        }

        // should only contains alphanumeric characters
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        this.setState({validUserName: usernameRegex.test(userName)});
    }

    validatePassword(e) {
        const password = e.target.value;
        
        if(!password || password.length == 0) {
            this.setState({validPassword: false});    
        }

        // https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        // The string must contain at least 1 numeric character, 1 uppercase character, one special character
        // , alphabetical character and eight characters or longer
        const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        this.setState({validPassword: passwordRegex.test(e.target.value)});
    }

    render() {
        return (
            <Container className="App">
                <h2>Sign In</h2>
                <Form className="form">
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
                                invalid = {!this.state.validUserName}
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
                                invalid = {!this.state.validPassword}
                            />
                        </FormGroup>
                    </Col>
                    <Button>Submit</Button>
                </Form>
            </Container>
        );
    }
}