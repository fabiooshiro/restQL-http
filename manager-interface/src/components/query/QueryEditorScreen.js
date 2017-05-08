// React
import React, { Component } from 'react';

// Bootstrap
import {
    Navbar,
    Button,
    FormGroup
} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.css';

// API Calls and processing
import {
  loadNamespaces,
  loadRevision,
  processResult
} from '../../api/restQLAPI';

// Redux actions
import { connect } from 'react-redux';
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

// Application Logic
import { 
  // UI Operations
  handleNewQuery,
  handleShowModal,

  
  // Listeners
  handleParamsChange,
  handleNamespaceChange,
  handleQueryNameChange,
  handleQueryStringChange,

  // Business logic operations
  handleLoadNamespaces,
  handleRunQuery,
  handleSaveQuery,
  handleLoadRevisions,
  handleLoadQueryRevision,

} from '../../actions/queryActionCreator';

// CSS for this screen and logo
import './QueryEditorScreen.css';
import Logo from '../restQL-logo.svg';

// Custom Components for this screen
import QuerySidebar from './QuerySidebar';
import QueryEditor from './QueryEditor';

class QueryEditorScreen extends Component {
  
  constructor(props) {
    super(props);
    handleLoadNamespaces();
  }

  toggleSidebar = () => {
		this.props.dispatch({
			type: QUERY_ACTIONS.TOGGLE_SIDEBAR,
		})
	}


  render() {
    return (
      <QuerySidebar className="QueryEditorScreen">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <object data={Logo} type="image/svg+xml">
                <img src={Logo} alt="Logo" />
              </object>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullRight>
              <FormGroup controlId="formInlineName">
                {/* TODO: Refactor the sidebar! */}
                <Button onClick={this.toggleSidebar} bsStyle="default">Queries</Button>
                <Button bsStyle="danger" onClick={handleNewQuery}>New Query</Button>
              </FormGroup>
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

        
        <div className="container">
            <QueryEditor
                // General props
                revisions={this.props.revisions}
                namespace={this.props.namespace}
                queryName={this.props.queryName}
                queryString={this.props.queryString}
                queryParams={this.props.queryParams}
                resultString={this.props.resultString}
                running={this.props.running}
                
                // Modal options and listeners
                showModal={this.props.showModal}
                toggleModal={handleShowModal}
                handleNamespaceChange={handleNamespaceChange}
                handleQueryNameChange={handleQueryNameChange}

                // RevisionCombo props
                shouldLoadRevisions={this.props.shouldLoadRevisions}
                loadRevisions={handleLoadRevisions}
                handleLoadQueryRevision={handleLoadQueryRevision}

                // Listeners to run query
                onQueryStringChange={handleQueryStringChange}
                onParamsChange={handleParamsChange} 

                // Actions                
                handleRun={handleRunQuery}
                handleSaveQuery={handleSaveQuery}
                handleRunQuery={handleRunQuery} />
        </div>
        
      </QuerySidebar>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
    queryString: state.queryReducer.query,
    queryParams: state.queryReducer.queryParams,
    resultString: state.queryReducer.queryResult,
    running: state.queryReducer.running,
    queryName: state.queryReducer.queryName,
    namespace: state.queryReducer.namespace,
    revisions: state.queryReducer.revisions,
    shouldLoadRevisions: state.queryReducer.shouldLoadRevisions,
    showModal: state.queryReducer.showModal,
});

export default connect(mapStateToProps, null)(QueryEditorScreen);