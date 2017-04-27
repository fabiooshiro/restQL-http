// React
import React, { Component } from 'react';

// Bootstrap
import {
    OverlayTrigger,
    Tooltip,
    Row,
    Col,
    Navbar,
    Button,
    FormGroup
} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.css';

// Code editor
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
// Code Theme
import 'codemirror/theme/eclipse.css';
// Code language
import 'codemirror/mode/javascript/javascript';
// Code folders
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter';

// Code Completion
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';

import '../../codemirror/restql';

// API Calls and processing
import { loadNamespaces, runQuery, saveQuery, processResult } from '../../api/restQLAPI';

// Redux actions
import { connect } from 'react-redux';
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

// CSS for this screen and logo
import './QueryEditorScreen.css';
import Logo from '../restQL-logo.svg';

// Custom Components for this screen
import SaveModal from './SaveModal';
import QuerySidebar from './QuerySidebar';

class QueryEditorScreen extends Component {
  
  constructor(props) {
    super(props);
    this.loadNamespaces();
  }

  newQuery = () => {
		this.props.dispatch({
			type: QUERY_ACTIONS.INITIAL_STATE
		});

		this.loadNamespaces();
	}

	loadNamespaces = () => {
		this.props.dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADING});

		loadNamespaces((response)=>{
			let result = processResult(response);

			if(result.error !== undefined) {
				this.props.dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: []});
				alert('Error loading namespaces: ' + result.error);
			}
			else {
				this.props.dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: result});
			}
		});
	}
  
  handleChange = (text) => {
    this.props.dispatch({
      type: QUERY_ACTIONS.READ_QUERY,
      value: text
    });
  }

  handleParamsChange = (evt) => {
    this.props.dispatch({
      type: QUERY_ACTIONS.READ_QUERY_PARAMS,
      value: evt.target.value
    });
  }

  handleRun = () => {
    const {queryString, queryParams} = this.props;

    this.props.dispatch({
      type: QUERY_ACTIONS.RUNNING_QUERY
    });

    runQuery(queryString, queryParams, this.handleResult);
  }

  handleResult = (result) => {
    let processed = processResult(result);
    let processedString = JSON.stringify(processed, null, 2);

    if(processed.error !== undefined) {
      this.props.dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: processedString
      });
    }
    else {
      this.props.dispatch({
        type: QUERY_ACTIONS.QUERY_SUCCESS,
        value: processedString
      });
    }
  }

  showModal = () => {
    this.props.dispatch({
      type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL,
    })
  }

  handleSave = () => {
    const query = this.props.queryString;
    const { namespace, queryName } = this.props;

    this.props.dispatch({
      type: QUERY_ACTIONS.SAVING_QUERY
    });

    saveQuery(namespace, queryName, query, (result) => {
      let processed = processResult(result);
      let processedString = JSON.stringify(processed, null, 2);

      if(result.error) {
        this.props.dispatch({
          type: QUERY_ACTIONS.QUERY_ERROR,
          value: processedString
        });
      }
      else {
        this.props.dispatch({
          type: QUERY_ACTIONS.QUERY_SAVED,
          value: processedString
        });

        this.loadNamespaces();
      }
    });
  }

  toggleSidebar = () => {
		this.props.dispatch({
			type: QUERY_ACTIONS.TOGGLE_SIDEBAR,
		})
	}


  editorContent = () => {
    
    const baseOptions = {
      lineNumbers: true,
      tabSize: 2,
      mode: 'restql',
      theme: 'eclipse',
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-brace-fold"]
    }
    
    const editorOptions = {
      ...baseOptions,
      extraKeys: {
        'Shift-Enter': this.handleRun,
        'Ctrl-S': this.showModal,
        'Cmd-S': this.showModal,
        'Ctrl-Space': 'autocomplete',
      },
      readOnly: this.props.running
    };
    
    const resultOptions = {
      ...baseOptions,
      mode: 'javascript',
      readOnly: true,
    };

    const runTooltip = (
      <Tooltip id="run-tooltip">
        <strong>Shift+Enter</strong>
      </Tooltip>
    );

    return (
      <Row>
        <Col sm={12} md={6} className="queryCol">
          <h3>Query</h3>
          <CodeMirror className="queryInput"
                  value={this.props.queryString}
                  onChange={this.handleChange}
                  options={editorOptions}/>  
          
          <div className="from-group">
            <label>Parameters</label>
            <input type="text"
                    className="form-control"
                    value={this.props.queryParams}
                    placeholder="name=test&age=18"
                    onChange={this.handleParamsChange} />
          </div>

          <div className="options">
            <OverlayTrigger placement="bottom" overlay={runTooltip}>
                <Button bsStyle="success"
                        onClick={this.handleRun}>Run Query</Button>
            </OverlayTrigger>

            <SaveModal onSave={this.handleSave} tooltip="Ctrl+S" />

          </div>
          
        </Col>

        <Col sm={12} md={6}>
          <h3>Result</h3>
          <CodeMirror value={this.props.resultString}
                  options={resultOptions}/>
        </Col>
      </Row>
    );
  }

  render() {
    
    const editor = this.editorContent();

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
                <Button onClick={this.toggleSidebar} bsStyle="default">Queries</Button>
                <Button bsStyle="danger" onClick={this.newQuery}>New Query</Button>
              </FormGroup>
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

        
        <div className="container">
            {editor}
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
    showModal: state.queryReducer.showModal,
});

export default connect(mapStateToProps, null)(QueryEditorScreen);