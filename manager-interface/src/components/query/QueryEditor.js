// React
import React, { Component } from 'react';

import {
    OverlayTrigger,
    Tooltip,
    Row,
    Col,
    Button,
} from 'react-bootstrap';

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

// Module Components
import SaveModal from './SaveModal';
import RevisionCombo from './RevisionCombo';
import TenantCombo from './TenantCombo';


export default class QueryEditor extends Component {

    render() {

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
            'Shift-Enter': this.props.handleRun,
            'Ctrl-S': this.props.toggleModal,
            'Cmd-S': this.props.toggleModal,
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
              <div className="queryTitle">
                  <h3>
                    Query
                    {
                      this.props.shouldLoadRevisions ?
                      this.props.loadRevisions() :  
                      <RevisionCombo toggle={this.props.revisions.length > 0}
                                     revisions={this.props.revisions}
                                     handleLoadQueryRevision={this.props.handleLoadQueryRevision} />
                    }
                  </h3>
              </div>

              <CodeMirror className="queryInput"
                          value={this.props.queryString}
                          onChange={this.props.onQueryStringChange}
                          options={editorOptions}/>

              <Row>
                <Col sm={12} md={9}>
                  <div className="from-group">
                      <label>Parameters</label>
                      <input type="text"
                            className="form-control"
                            value={this.props.queryParams}
                            placeholder="name=test&age=18"
                            onChange={this.props.onParamsChange} />
                  </div>
                </Col>

                <Col sm={12} md={3}>
                  <TenantCombo className="from-group" 
                              tenants={this.props.tenants}
                              handleSetTenant={this.props.handleSetTenant} />
                      
                </Col>
              </Row>
              

              <div className="options">
                  <OverlayTrigger placement="bottom" overlay={runTooltip}>
                      <Button bsStyle="success"
                              onClick={this.props.handleRunQuery}>Run Query</Button>
                  </OverlayTrigger>

                  <SaveModal onSave={this.props.handleSaveQuery}
                             namespace={this.props.namespace}
                             queryName={this.props.queryName}
                             handleNamespaceChange={this.props.handleNamespaceChange}
                             handleQueryNameChange={this.props.handleQueryNameChange}
                             show={this.props.showModal}
                             toggleModal={this.props.toggleModal}
                             tooltip="Ctrl+S" />

              </div>

              </Col>

              <Col sm={12} md={6}>
              <h3>Result</h3>
              <CodeMirror className="queryResult"
                          value={this.props.resultString}
                          options={resultOptions}/>
            </Col>
          </Row>
        );
    }
  }