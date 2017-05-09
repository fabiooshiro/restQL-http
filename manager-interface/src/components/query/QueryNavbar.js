import React, { Component } from 'react';

import {
    Navbar,
    Button,
    FormGroup
} from 'react-bootstrap';

export default class QueryNavbar extends Component {
	
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
							<Button bsStyle="default"
											onClick={this.props.toggleSidebar}>
								Queries
							</Button>
							<Button bsStyle="danger" onClick={this.props.newQuery}>New Query</Button>
						</FormGroup>
					</Navbar.Form>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}