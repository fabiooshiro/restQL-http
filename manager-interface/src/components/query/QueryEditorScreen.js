import React, { Component } from 'react';
import { connect } from 'react-redux';

// Code editor
import CodeMirror from 'react-codemirror';
import '../../../node_modules/codemirror/lib/codemirror.css';
// Code Theme
import '../../../node_modules/codemirror/theme/eclipse.css';
// Code language
import '../../../node_modules/codemirror/mode/javascript/javascript';
// Code folders
import '../../../node_modules/codemirror/addon/fold/foldgutter.css';
import '../../../node_modules/codemirror/addon/fold/brace-fold';
import '../../../node_modules/codemirror/addon/fold/foldgutter';

// API Calls and processing
import { runQuery, processResult } from '../../api/restQLAPI';

// Redux actions
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

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
    };
    
    const resultOptions = {
      ...baseOptions,
      mode: 'javascript',
      readOnly: true,
    };

    return (
      <div className="QueryEditorScreen">
        <CodeMirror value={this.props.queryString}
                    onChange={this.handleChange}
                    options={editorOptions}/>

        <hr />

        <CodeMirror value={this.props.resultString}
                    options={resultOptions}/>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
    queryString: state.queryReducer.query,
    resultString: state.queryReducer.queryResult,
});

export default connect(mapStateToProps, null)(QueryEditorScreen);