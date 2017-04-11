import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap';

// Redux actions
import { connect } from 'react-redux';
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

class SaveModal extends Component {

	getDefaultState() {
		return {
			namespace: '',
			query: ''
		};
	}

	constructor(props) {
		super(props);

		this.state = this.getDefaultState();
	}

	toggleModal = () => {
    this.props.dispatch({
      type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL,
    })
  }

	handleNamespaceChange = (evt) => {
		this.setState({namespace: evt.target.value});
	}

	handleQueryChange = (evt) => {
		this.setState({query: evt.target.value});
	}

	handleSave = () => {
		let callback = this.props.onSave;
		callback();

		this.toggleModal();
	}

	render() {
		return (
			<span>
				<Button bsStyle="info" onClick={this.toggleModal} >Save Query</Button>

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
										value={this.props.query}
										onChange={this.handleQueryChange} />
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