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
    }

    async componentWillMount() {
        let credentials = await ApiHandler.callGetCredentials(this.props.jwt_token)

        this.setState({
            credentials: credentials.data || []
        })
    }

    async addCredential(email, password) {
        let credentials = await ApiHandler.callAddCredential(this.props.jwt_token, email, password)

        this.setState({
            credentials: credentials.data || []
        })
    }

    render() {
        let credentialGridHolder = []
        for (let i = 0; i < this.state.credentials.length; i++) {
            credentialGridHolder.push(<CredentialRawHolder key={i} index={i} username={this.state.credentials[i].email}
                password={this.state.credentials[i].password} />)
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