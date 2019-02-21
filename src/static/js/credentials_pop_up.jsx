import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import {
  Col,
  FormGroup, Label, Input,
  Button,
} from 'reactstrap';

export default class CredentialModal extends React.Component {
  constructor(props) {
    super(props);
    this.oldEmailValue = this.props.email
    this.emailValue = this.props.email
    this.passwordValue = this.props.password

    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
    this.registeremail = this.registeremail.bind(this)
    this.registerPassword = this.registerPassword.bind(this)
    this.trigerCallback = this.trigerCallback.bind(this);
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

  trigerCallback() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
    this.props.callback(this.emailValue, this.passwordValue, this.oldEmailValue)
  }


  render() {
    this.oldEmailValue = this.props.email
    return (
      <div>
        <Button color="primary" onClick={this.toggle}> {this.props.btnText} </Button>
        <Modal size="lg" isOpen={this.state.modal} toggle={this.toggle} className="lg">
          <ModalHeader toggle={this.toggle}>{this.props.btnText}</ModalHeader>
          <ModalBody>
            <Col>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  id="userNameInput"
                  placeholder="my user name"
                  onChange={e => {
                    this.registeremail(e)
                  }}
                  defaultValue={this.props.email}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="examplePassword">Password</Label>
                <Input
                  type="text"
                  id="passwordInput"
                  placeholder="my password"
                  onChange={e => {
                    this.registerPassword(e)
                  }}
                  defaultValue={this.props.password}
                />
              </FormGroup>
            </Col>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.trigerCallback}>Submit</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}