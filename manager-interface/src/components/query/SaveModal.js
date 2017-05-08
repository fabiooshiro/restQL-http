import React, { Component } from 'react';
import {Modal, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';

export default class SaveModal extends Component {
  
	handleSave = () => {
		let callback = this.props.onSave;
		callback();

		this.props.toggleModal();
	}

	render() {

		const button = (<Button bsStyle="info" onClick={this.props.toggleModal} >Save Query</Button>);

		const saveTooltip = (
			<Tooltip id="save-tooltip">
				<strong>{this.props.tooltip}</strong>
			</Tooltip>
		);

		const buttonWithTooltip = (this.props.tooltip ? (
			<OverlayTrigger placement="bottom" overlay={saveTooltip}>
				{button}
			</OverlayTrigger>
		) : button );

		return (
			<span>
				
				{buttonWithTooltip}

				<Modal show={this.props.show} onHide={this.props.toggleModal}>
					<Modal.Header>
						<Modal.Title>Save Query</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="form-group">
							<label>Namespace</label>
							<input type="text"
										className="form-control"
										value={this.props.namespace}
										onChange={this.props.handleNamespaceChange} />
						</div>

						<div className="form-group">
							<label>Query Name</label>
							<input type="text"
										className="form-control"
										value={this.props.queryName}
										onChange={this.props.handleQueryNameChange} />
						</div>
					</Modal.Body>

					<Modal.Footer>
						<Button bsStyle="success" onClick={this.handleSave}>Save</Button>
						<Button onClick={this.props.toggleModal}>Close</Button>
					</Modal.Footer>
				</Modal>
			</span>
		);
	}

}