// React
import React, { Component } from 'react';
import { connect } from 'react-redux';

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

// API Calls and processing
import { runQuery, saveQuery, processResult } from '../../api/restQLAPI';

// Redux actions
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

// CSS for this screen and logo
import './QueryEditorScreen.css';
import Logo from '../restQL-logo.svg';

// Custom Components for this screen
import SaveModal from './SaveModal';


class QueryEditorScreen extends Component {
  
  handleChange = (text) => {
    this.props.dispatch({
      type: QUERY_ACTIONS.READ_QUERY,
      value: text
    });
  }

  handleRun = () => {
    const query = this.props.queryString;

    this.props.dispatch({
      type: QUERY_ACTIONS.RUNNING_QUERY
    });

    runQuery(query, this.handleResult);
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

  handleSave = (namespace, queryName) => {
    const query = this.props.queryString;

    this.props.dispatch({
      type: QUERY_ACTIONS.SAVING_QUERY
    });

    saveQuery(namespace, queryName, query, (error) => {
      if(error)
        this.props.dispatch({type: QUERY_ACTIONS.QUERY_ERROR, value: 'Error'});
      else
        this.props.dispatch({type: QUERY_ACTIONS.QUERY_SAVED});
    });
  }

  render() {
    const baseOptions = {
      lineNumbers: true,
      tabSize: 2,
      mode: 'text',
      theme: 'eclipse',
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-brace-fold"]
    }
    
    const editorOptions = {
      ...baseOptions,
      extraKeys: { 'Shift-Enter': this.handleRun },
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
      <div className="QueryEditorScreen">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <img src={Logo} alt="Logo" />
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullRight>
              <FormGroup controlId="formInlineName">
                <OverlayTrigger placement="bottom" overlay={runTooltip}>
                  <Button bsStyle="success"
                          onClick={this.handleRun}>Run Query</Button>
                </OverlayTrigger>

                <SaveModal onSave={this.handleSave} />
              </FormGroup>
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

        <div className="container">
          <Row>
            <Col sm={12} md={6}>
              <h3>Query</h3>
              <CodeMirror value={this.props.queryString}
                      onChange={this.handleChange}
                      options={editorOptions}/>  
            </Col>

            <Col sm={12} md={6}>
              <h3>Result</h3>
              <CodeMirror value={this.props.resultString}
                      options={resultOptions}/>
            </Col>
          </Row>
        </div>
        
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
    queryString: state.queryReducer.query,
    resultString: state.queryReducer.queryResult,
    running: state.queryReducer.running,
});

export default connect(mapStateToProps, null)(QueryEditorScreen);