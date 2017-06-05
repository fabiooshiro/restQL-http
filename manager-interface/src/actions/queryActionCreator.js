/**
 * Every action related to the query components
 * is centralized here.
 */

// Redux actions
import { QUERY_ACTIONS } from '../reducers/queryReducer';

// API Calls and processing dependencies
import {
  loadNamespaces,
  loadQueries,
  loadRevisions,
  loadRevision,
  loadRevisionByUrl,
  runQuery,
  saveQuery,
  processResult
} from '../api/restQLAPI';


const store = require('../store/storeConfig').store;

// UI State manipulation
export function handleNewQuery() {
  store.dispatch({
    type: QUERY_ACTIONS.INITIAL_STATE
  });

  handleLoadNamespaces();
}


export function handleShowModal () {
  store.dispatch({
    type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL,
  });
}

export function handleToggleSidebar() {
  store.dispatch({
    type: QUERY_ACTIONS.TOGGLE_SIDEBAR,
  });
}


// Listeners
export function handleNamespaceChange(evt) {
  store.dispatch({type: QUERY_ACTIONS.NAMESPACE_CHANGED, value: evt.target.value});
}

export function handleQueryNameChange(evt) {
  store.dispatch({type: QUERY_ACTIONS.QUERY_NAME_CHANGED, value: evt.target.value});
}


export function handleQueryStringChange(text) {
  store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY,
    value: text
  });
}

export function handleParamsChange(evt) {
  store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY_PARAMS,
    value: evt.target.value
  });
}


// Async API Calls
export function handleRunQuery() {

    const dispatch = store.dispatch;
    const {query, queryParams} = store.getState().queryReducer;
    const {tenant} = store.getState().environmentReducer;

    dispatch({
      type: QUERY_ACTIONS.RUNNING_QUERY
    });

    runQuery(query, queryParams, tenant, (result)=>{
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

  const dispatch = store.dispatch;
  const { namespace, queryName, query } = store.getState().queryReducer;
  const { tenant } = store.getState().environmentReducer;

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

  saveQuery(tenant, namespace, queryName, query, (result) => {
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
  const dispatch = store.dispatch;
  
  dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADING});

  loadNamespaces((response)=>{
    let result = processResult(response);

    if(result.error !== undefined) {
      dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: []});
      alert('Error loading namespaces: ' + result.error);
    }
    else {
      dispatch({type: QUERY_ACTIONS.NAMESPACES_LOADED, value: result});
    }
  });
};

export function handleLoadRevisions(){
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

export function handleLoadQueries(namespace, evt) {
  const dispatch = store.dispatch;
  
  dispatch({
			type: QUERY_ACTIONS.QUERIES_LOADING,
			value: namespace
		});

		loadQueries(namespace, (response)=>{

			let result = processResult(response);

			if(result.error !== undefined) {
				dispatch({type: QUERY_ACTIONS.QUERIES_LOADED, value: []});
				alert('Error loading queries: ' + result.error);
			}
			else {
				dispatch({
					type: QUERY_ACTIONS.QUERIES_LOADED,
					value: result.queries
				});
			}

		});
}

export function handleLoadQuery(query, evt) {
  const dispatch = store.dispatch;

  dispatch({
    type: QUERY_ACTIONS.QUERY_LOADING
  });

  loadRevisionByUrl(query['last-revision'], (response)=>{
    if(response.error === null) {
      dispatch({
        type: QUERY_ACTIONS.QUERY_LOADED,
        queryName: query.id,
        value: response.body.text
      });

      dispatch({
        type: QUERY_ACTIONS.LOAD_REVISIONS,
      });
    }
    else {
      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: response.body.text
      });
    }
    
  })
}