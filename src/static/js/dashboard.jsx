import React from "react";
import { ApiHandler } from "./api_handler";
import { Table, Button } from 'reactstrap';
import CredentialRawHolder from './dashboard_row'
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            credentials: []
        }
    }

    async componentWillMount() {
        let credentials = await ApiHandler.callGetCredentials(this.props.jwt_token)

        console.log(credentials.data)

        this.setState({
            credentials: credentials.data || []
        })
    }

    render() {
        let credentialGridHolder = []
        for (let i = 0; i < this.state.credentials.length; i++) {
            credentialGridHolder.push(<CredentialRawHolder index={i} username={this.state.credentials[i].email}
                password={this.state.credentials[i].password} />)
        }
        return (
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

        );
    }
}