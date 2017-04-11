import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap';


export default class SaveModal extends Component {

	getDefaultState() {
		return {
			showModal: false,
			namespace: '',
			query: ''
		};
	}

	constructor(props) {
		super(props);

		this.state = this.getDefaultState();
	}

	open = () => {
		this.setState({showModal: true});
	}

	close = () => {
    this.setState({showModal: false});
  }

	handleNamespaceChange = (evt) => {
		this.setState({namespace: evt.target.value});
	}

	handleQueryChange = (evt) => {
		this.setState({query: evt.target.value});
	}

	handleSave = () => {
		let callback = this.props.onSave;
		callback(this.state.namespace, this.state.query);

		this.close();
	}

	render() {
		return (
			<span>
				<Button bsStyle="info" onClick={this.open} >Save Query</Button>

				<Modal show={this.state.showModal} onHide={this.close}>
					<Modal.Header>
						<Modal.Title>Save Query</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="form-group">
							<label>Namespace</label>
							<input type="text"
										className="form-control"
										value={this.state.namespace}
										onChange={this.handleNamespaceChange} />
						</div>

						<div className="form-group">
							<label>Query Name</label>
							<input type="text"
										className="form-control"
										value={this.state.query}
										onChange={this.handleQueryChange} />
						</div>
					</Modal.Body>

					<Modal.Footer>
						<Button bsStyle="success" onClick={this.handleSave}>Save</Button>
						<Button onClick={this.close}>Close</Button>
					</Modal.Footer>
				</Modal>
			</span>
		);
	}

}