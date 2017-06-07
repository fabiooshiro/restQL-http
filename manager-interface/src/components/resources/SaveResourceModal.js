import React, { Component } from 'react';

import { Alert, Button, Modal } from 'react-bootstrap';

export default class SaveResourcesModal extends Component {
	
	render() {

		if(this.props.activeResource) {
			const updated = this.props.resourceUpdated;
			const message = this.props.updateMessage;

			return (
				<Modal show={this.props.show} onHide={this.props.toggleModal}>
					<Modal.Header>
						<Modal.Title>Save Resource</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{
							message !== null ?
							<Alert bsStyle={this.props.resourceUpdated ? 'success' : 'danger'}>
								{message}
							</Alert> : ''
						}

						<div className="form-group">
							<label>Tenant</label>
							<p>{this.props.tenant}</p>
						</div>

						<div className="form-group">
							<label>Authorization Key</label>
							<input type="text"
										className="form-control"
										value={this.props.authorizationKey}
										onChange={this.props.handleAuthorizationKeyChanged} />
						</div>

						<div className="form-group">
							<label>Resource Name</label>
							<input type="text"
										className="form-control"
										value={this.props.activeResource.name}
										onChange={this.props.handleResourceNameChanged} />
						</div>

						<div className="form-group">
							<label>Resource Url</label>
							<input type="text"
										className="form-control"
										value={this.props.activeResource.url}
										onChange={this.props.handleResourceUrlChanged} />
						</div>
					</Modal.Body>

					<Modal.Footer>
						<Button bsStyle="success" onClick={this.props.handleSave}>Save</Button>
						<Button onClick={this.props.toggleModal}>Close</Button>
					</Modal.Footer>
				</Modal>
			);
		}
		else
			return null;
	}
}