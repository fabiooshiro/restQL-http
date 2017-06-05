import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import {
    Navbar,
    FormGroup
} from 'react-bootstrap';

export default class ResourcesNavbar extends Component {
	
	render() {
		return (
			<Navbar>
				<Navbar.Header>
					<Navbar.Brand>
						<object data={this.props.logo} type="image/svg+xml">
							<img src={this.props.logo} alt="Logo" />
						</object>
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Navbar.Form pullRight>
						<FormGroup controlId="formInlineName">
							<Link to={this.props.queryEditorLink} className="btn btn-md btn-info">
                                Query Editor
                            </Link>
						</FormGroup>
					</Navbar.Form>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}