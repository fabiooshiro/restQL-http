import React, { Component } from 'react';
import {Modal, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';

// Redux actions
import { connect } from 'react-redux';
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

class SaveModal extends Component {
  
  toggleModal = () => {
    this.props.dispatch({
      type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL,
    })
  }

	handleNamespaceChange = (evt) => {
		this.props.dispatch({type: QUERY_ACTIONS.NAMESPACE_CHANGED, value: evt.target.value});
	}

	handleQueryNameChange = (evt) => {
		this.props.dispatch({type: QUERY_ACTIONS.QUERY_NAME_CHANGED, value: evt.target.value});
	}

	handleSave = () => {
		let callback = this.props.onSave;
		callback();

		this.toggleModal();
	}

	render() {

		const button = (<Button bsStyle="info" onClick={this.toggleModal} >Save Query</Button>);

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

				<Modal show={this.props.showModal} onHide={this.close}>
					<Modal.Header>
						<Modal.Title>Save Query</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="form-group">
							<label>Namespace</label>
							<input type="text"
										className="form-control"
										value={this.props.namespace}
										onChange={this.handleNamespaceChange} />
						</div>

						<div className="form-group">
							<label>Query Name</label>
							<input type="text"
										className="form-control"
										value={this.props.queryName}
										onChange={this.handleQueryNameChange} />
						</div>
					</Modal.Body>

					<Modal.Footer>
						<Button bsStyle="success" onClick={this.handleSave}>Save</Button>
						<Button onClick={this.toggleModal}>Close</Button>
					</Modal.Footer>
				</Modal>
			</span>
		);
	}

}

const mapStateToProps = (state, ownProps) => ({
    showModal: state.queryReducer.showModal,
	queryName: state.queryReducer.queryName,
    namespace: state.queryReducer.namespace,
});

export default connect(mapStateToProps, null)(SaveModal);