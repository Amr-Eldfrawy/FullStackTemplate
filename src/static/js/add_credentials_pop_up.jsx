import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import {
  Col,
  FormGroup, Label, Input,
  Button,
} from 'reactstrap';

export default class AddCredentialsModal extends React.Component {
  constructor(props) {
    super(props);

    this.emailValue = null
    this.passwordValue = null

    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
    this.registeremail = this.registeremail.bind(this)
    this.registerPassword = this.registerPassword.bind(this)
    this.trigerAddingCredentialCall = this.trigerAddingCredentialCall.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  registeremail(e) {
    const email = e.target.value;
    this.emailValue = email;
  }

  registerPassword(e) {
    const password = e.target.value;
    this.passwordValue = password;
  }

  trigerAddingCredentialCall() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
    this.props.callback(this.emailValue, this.passwordValue)
  }


  render() {
    return (
      <div>
        <Button color="primary" onClick={this.toggle}> Add New Credentials </Button>
        <Modal size="lg" isOpen={this.state.modal} toggle={this.toggle} className="lg">
          <ModalHeader toggle={this.toggle}>Adding A New Credentials</ModalHeader>
          <ModalBody>
            <Col>
              <FormGroup>
                <Label>Username</Label>
                <Input
                  type="email"
                  id="userNameInput"
                  placeholder="my user name"
                  onChange={e => {
                    this.registeremail(e)
                  }}
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
                    this.registerPassword(e)
                  }}
                />
              </FormGroup>
            </Col>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.trigerAddingCredentialCall}>Add</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}