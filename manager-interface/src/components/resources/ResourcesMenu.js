import React, { Component } from 'react';

import {
    Nav,
    NavItem
} from 'react-bootstrap';

export default class ResourcesMenu extends Component {
	
	renderItems = () => {
		return this.props.tenants.map(
			(tenant, index) =>
				<NavItem key={index}
						 active={String(index) === String(this.props.activeTenant)}
						 eventKey={index}>
					{tenant}
				</NavItem>
		);
	}

	render() {
		const items = this.renderItems();

		return (
			<Nav bsStyle="pills"
				 className={this.props.className}
				 stacked
				 onSelect={this.props.handleActiveTenant}>
				{items}
			</Nav>
		);
	}
}