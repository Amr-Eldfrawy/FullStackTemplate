
import React from "react";

import { Link } from 'react-router-dom'

import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
} from 'reactstrap'

export default class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let pmNavBar =
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink> <Link to={'/'}> Sign In</Link></NavLink>
                </NavItem>

                <NavItem>
                    <NavLink>  <Link to={'/register'}>Register</Link></NavLink>
                </NavItem>
            </Nav >

        if (this.props.authenticated) {
            pmNavBar =
                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink> <Link to={'/dashboard'}>Dashboard</Link></NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink onClick={() => { this.props.redirectToLogin() }}> LogOut </NavLink>
                    </NavItem>
                </Nav >
        }
        return (
            <Navbar color="light" light expand="md">
                <NavbarBrand> HU Password Manager</NavbarBrand>
                {pmNavBar}
            </Navbar>
        );
    }
}