import React from "react";
import { ApiHandler } from "./api_handler";
import { Table, Container, Button, Row, Col} from 'reactstrap';
import CredentialRawHolder from './dashboard_row'
import CredentialModal from './credentials_pop_up'
import { generatePassword } from './password_manager' 

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            credentials: []
        }

        this.addCredential = this.addCredential.bind(this)
        this.deleteCredential = this.deleteCredential.bind(this)
        this.editCredential = this.editCredential.bind(this)
    }

    async componentWillMount() {
        let credentials = await ApiHandler.callGetCredentials(this.props.jwt_token)

        this.setState({
            credentials: credentials.data || []
        })
    }

    async addCredential(email, password) {
        let addCredentialResponse = await ApiHandler.callAddCredential(this.props.jwt_token, email, password)

        if(addCredentialResponse.status) {
            this.setState({
                credentials: addCredentialResponse.credentials || []
            })
            alert("credentials was added");
        } else {
            alert(addCredentialResponse.msg)
        }
         
    }

    async deleteCredential(email) {
        let deleteCredentialResponse = await ApiHandler.callDeleteCredentials(this.props.jwt_token, email)
        if(deleteCredentialResponse.status) {
            this.setState({
                credentials: deleteCredentialResponse.credentials || []
            })
            alert("credentials was deleted");
        } else {
            alert(deleteCredentialResponse.msg)
        }
       
    }

    async editCredential(new_email, password, old_email) {
        if(!new_email || new_email.length == 0 || !password || password.length == 0 ||
            !old_email || old_email.length == 0) {
            alert('Can not set email/password to empty value');
        }

        let editCredentialResponse = await ApiHandler.callEditCredential(this.props.jwt_token, old_email, new_email, password)
        if(editCredentialResponse.status) {
            this.setState({
                credentials: editCredentialResponse.credentials || []
            })
            alert("credentials was edited");
        } else {
            alert(editCredentialResponse.msg)
        }
       
    }

    render() {
        let credentialGridHolder = []
        let credentials =  this.state.credentials
        for (let i = 0; i < credentials.length; i++) {
            credentialGridHolder.push(<CredentialRawHolder key={i} index={i} email={credentials[i].email}
                password={credentials[i].password} deleteCallback={this.deleteCredential} editCallback={this.editCredential}/>)
        }
        return (
            <Container>
                <Table responsive className="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {credentialGridHolder}
                    </tbody>
                </Table>
                <Row>
                    <Col>
                        <CredentialModal callback={this.addCredential} btnText="Add New Credential"/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button color="primary" onClick={() => generatePassword()}> Generate New Password </Button>
                    </Col>
                </Row>
            </Container>
        );
    }
}