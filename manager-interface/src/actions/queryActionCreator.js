/**
 * Every action related to the query components
 * is centralized here.
 */

// Redux actions
import { QUERY_ACTIONS } from '../reducers/queryReducer';

// API Calls and processing dependencies
import {
  loadNamespaces,
  loadRevisions,
  loadRevision,
  runQuery,
  saveQuery,
  processResult
} from '../api/restQLAPI';


// UI State manipulation
export function handleNewQuery() {
  window.store.dispatch({
    type: QUERY_ACTIONS.INITIAL_STATE
  });

  handleLoadNamespaces();
}


export function handleShowModal () {
  window.store.dispatch({
    type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL,
  });
}

// Listeners
export function handleNamespaceChange(evt) {
  window.store.dispatch({type: QUERY_ACTIONS.NAMESPACE_CHANGED, value: evt.target.value});
}

export function handleQueryNameChange(evt) {
  window.store.dispatch({type: QUERY_ACTIONS.QUERY_NAME_CHANGED, value: evt.target.value});
}


export function handleQueryStringChange(text) {
  window.store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY,
    value: text
  });
}

export function handleParamsChange(evt) {
  window.store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY_PARAMS,
    value: evt.target.value
  });
}


// Async API Calls
export function handleRunQuery() {

    const store = window.store;

    const dispatch = store.dispatch;
    const {query, queryParams} = store.getState().queryReducer;

    dispatch({
      type: QUERY_ACTIONS.RUNNING_QUERY
    });

    runQuery(query, queryParams, (result)=>{
        let processed = processResult(result);
        let processedString = JSON.stringify(processed, null, 2);

        if(processed.error !== undefined) {
            dispatch({
                type: QUERY_ACTIONS.QUERY_ERROR,
                value: processedString
            });
        }
        else {
            dispatch({
                type: QUERY_ACTIONS.QUERY_SUCCESS,
                value: processedString
            });
        }
    });
}

export function handleSaveQuery(){
  const store = window.store;

  const dispatch = store.dispatch;
  const { namespace, queryName, query } = store.getState().queryReducer;

  dispatch({
    type: QUERY_ACTIONS.SAVING_QUERY
  });

  if(namespace.trim() === '' || queryName.trim() === '' || query.trim() === '') {
    const error = {"error":"Namespace, Query Name and Query can't be empty!"};
    
    return dispatch({
      type: QUERY_ACTIONS.QUERY_ERROR,
      value: JSON.stringify(error, null, 2),
    });
  }

  saveQuery(namespace, queryName, query, (result) => {
    let processed = processResult(result);
    let processedString = JSON.stringify(processed, null, 2);

    if(result.error) {
      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: processedString
      });
    }
    else {
      dispatch({
        type: QUERY_ACTIONS.QUERY_SAVED,
        value: processedString
      });

      dispatch({
          type: QUERY_ACTIONS.LOAD_REVISIONS,
      });

      handleLoadNamespaces();
    }
  });
}

export function handleLoadNamespaces(){
  const store = window.store;
  const dispatch = store.dispatch;
  
  dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADING});

  loadNamespaces((response)=>{
    let result = processResult(response);

    if(result.error !== undefined) {
      dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: []});
      alert('Error loading namespaces: ' + result.error);
    }
    else {processResult
      dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: result});
    }
  });
};

export function handleLoadRevisions(){
  const store = window.store;
  const dispatch = store.dispatch;

  const { namespace, queryName } = store.getState().queryReducer;

  dispatch({type: QUERY_ACTIONS.REVISIONS_LOADING});

  loadRevisions(namespace, queryName, (response)=>{
    let result = processResult(response);
    
    if(result.error !== undefined) {
      dispatch({
        type: QUERY_ACTIONS.REVISIONS_LOADED, value: []
      });
    }
    else {
      dispatch({
        type: QUERY_ACTIONS.REVISIONS_LOADED,
        value: result.revisions
      });
    }
  });
}

export function handleLoadQueryRevision(evt) {
  const store = window.store;
  const dispatch = store.dispatch;

  const { namespace, queryName } = store.getState().queryReducer;
  
  dispatch({type: QUERY_ACTIONS.QUERY_LOADING});

  loadRevision(namespace, queryName, evt.target.value, (response)=>{
    if(response.error === null) {
      dispatch({
        type: QUERY_ACTIONS.QUERY_LOADED,
        queryName: queryName,
        value: response.body.text
      });
    }
    else {
      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: response.body.text
      });
    }
  });
}