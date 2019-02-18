import React from "react";
import { ApiHandler } from "./api_handler";
import { Table, Button, Container, Row, Col } from 'reactstrap';
import CredentialRawHolder from './dashboard_row'
import AddCredentialsModal from './add_credentials_pop_up'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            credentials: []
        }

        this.addCredential = this.addCredential.bind(this)
        this.deleteCredential = this.deleteCredential.bind(this)
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
        console.log("email to delete" + email)
        let deleteCredentialResponse = await ApiHandler.callDeleteCredentials(this.props.jwt_token, email)
        console.log("delete response")
        console.log(deleteCredentialResponse)
        if(deleteCredentialResponse.status) {
            this.setState({
                credentials: deleteCredentialResponse.credentials || []
            })
            alert("credentials was deleted");
        } else {
            alert(deleteCredentialResponse.msg)
        }
       
    }

    render() {
        let credentialGridHolder = []
        let credentials =  this.state.credentials
        console.log("credentials to render")
        console.log(credentials)
        for (let i = 0; i < credentials.length; i++) {
            console.log()
            credentialGridHolder.push(<CredentialRawHolder key={i} index={i} email={credentials[i].email}
                password={credentials[i].password} deleteCallback={this.deleteCredential}/>)
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
                        </tr>
                    </thead>
                    <tbody>
                        {credentialGridHolder}
                    </tbody>
                </Table>

                <AddCredentialsModal callback={this.addCredential} />

            </Container>
        );
    }
}