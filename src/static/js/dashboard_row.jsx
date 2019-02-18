import React from "react";
import { Button } from 'reactstrap';

export default class CredentialRawHolder extends React.Component {
    constructor(props) {
        super(props);

        this.copyToClipboard = this.copyToClipboard.bind(this)
        this.delete = this.delete.bind(this)
    }
    
    async delete() {
        this.props.deleteCallback(this.props.email);
    }

    // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
    copyToClipboard() {
        let str = this.props.password

        const el = document.createElement('textarea');  // Create a <textarea> element
        el.value = str;                                 // Set its value to the string that you want copied
        el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
        el.style.position = 'absolute';
        el.style.left = '-9999px';                      // Move outside the screen to make it invisible
        document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
        const selected =
            document.getSelection().rangeCount > 0        // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0)     // Store selection if found
                : false;                                    // Mark as false to know no selection existed before
        el.select();                                    // Select the <textarea> content
        document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el);                  // Remove the <textarea> element
        if (selected) {                                 // If a selection existed before copying
            document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
            document.getSelection().addRange(selected);   // Restore the original selection
        }
    };

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
                <td><Button onClick={this.copyToClipboard}>Copy Password</Button></td>
                <td><Button onClick={this.delete}>Delete Credential</Button></td>
            </tr>
        );
    }
}