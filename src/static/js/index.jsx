import React from "react";
import ReactDOM from "react-dom";
import PMForm from './pm_form'
import {
    BrowserRouter as Router, Link, Route
} from 'react-router-dom'

import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Collapse
} from 'reactstrap'

ReactDOM.render(
    <Router>
        <div>
            <Navbar color="light" light expand="md">
                <NavbarBrand> HU Password Manager</NavbarBrand>

                <Collapse navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink> <Link to={'/'}> Sign In</Link></NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink>  <Link to={'/register'}>Register</Link></NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>

            <aside>


            </aside>


            <main>
                <Route exact path="/" render={() => (<PMForm header={<h2>Sign In</h2>} />)} />
                <Route path="/register" render={() => (<PMForm header={<h2>Register</h2>} />)} />
            </main>
        </div>
    </Router>
    , document.getElementById("content"));
