import React from "react";
import { Button } from 'reactstrap';
import CredentialModal from './credentials_pop_up'
import {copyToClipboard} from './password_manager'

export default class CredentialRawHolder extends React.Component {
    constructor(props) {
        super(props);

        this.delete = this.delete.bind(this)
    }

    async delete() {
        this.props.deleteCallback(this.props.email);
    }

    render() {
        let passwordPlaceHolder = this.props.password;
        passwordPlaceHolder = passwordPlaceHolder.replace(/./g, '*')

        if (passwordPlaceHolder.length > 7) {
            passwordPlaceHolder = passwordPlaceHolder.substring(0, 7)
        }
        return (
            <tr>
                <th scope="row">{this.props.index}</th>
                <td>{this.props.email}</td>
                <td>{passwordPlaceHolder}</td>
                <td><Button color="primary" onClick={() => copyToClipboard(this.props.password)}>Copy Password</Button></td>
                <td><Button onClick={this.delete}>Delete Credential</Button></td>
                <td><CredentialModal email={this.props.email} password={this.props.password}
                    callback={this.props.editCallback} btnText="Edit Credential" /></td>
            </tr>
        );
    }
}