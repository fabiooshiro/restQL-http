// Initial state
export const initialState = {
    namespace: '',
    queryName: '',
    query: '',
    queryParams: '',
    running: false,
    error: false,
    queryResult: '',
    showModal: false,
    showSidebar: false,
    
    loadingNamespaces: false,
    loadingQueries: false,
    namespaces: [],
    queries: [],
    revisions: [],

    shouldLoadRevisions: false,
};

// Enum for query actions
export const QUERY_ACTIONS = {
    INITIAL_STATE: 'INITIAL_STATE',

    READ_QUERY: 'READ_QUERY',
    READ_QUERY_PARAMS: 'READ_QUERY_PARAMS',
    TOGGLE_QUERY_PARAMS: 'TOGGLE_QUERY_PARAMS',
    RUNNING_QUERY: 'RUNNING_QUERY',
    QUERY_ERROR: 'QUERY_ERROR',
    QUERY_SUCCESS: 'QUERY_SUCCESS',
    SAVING_QUERY: 'SAVING_QUERY',
    QUERY_SAVED: 'QUERY_SAVED',
    
    TOGGLE_SAVE_MODAL: 'TOGGLE_SAVE_MODAL',
    TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',

    NAMESPACE_CHANGED: 'NAMESPACE_CHANGED',
    QUERY_NAME_CHANGED: 'QUERY_NAME_CHANGED',

    NAMESPACES_LOADING: 'NAMESPACES_LOADING',
    NAMESPACES_LOADED: 'NAMESPACES_LOADED',
    QUERIES_LOADING: 'QUERIES_LOADING',
    QUERIES_LOADED: 'QUERIES_LOADED',
    QUERY_LOADING: 'QUERY_LOADING',
    QUERY_LOADED: 'QUERY_LOADED',

    REVISIONS_LOADING: 'REVISIONS_LOADING',
    REVISIONS_LOADED: 'REVISIONS_LOADED',
    LOAD_REVISIONS: 'LOAD_REVISIONS',
};

const queryReducer = (state = initialState, action) => {
    switch (action.type) {
        case QUERY_ACTIONS.READ_QUERY:
            return {...state, query: action.value};
        case QUERY_ACTIONS.READ_QUERY_PARAMS:
            return {...state, queryParams: action.value};
        case QUERY_ACTIONS.RUNNING_QUERY:
            return {...state, running: true, error: false, queryResult: ''};
        case QUERY_ACTIONS.QUERY_ERROR:
            return {...state, running: false, error: true, queryResult: action.value};
        case QUERY_ACTIONS.QUERY_SUCCESS:
            return {...state, running: false, error: false, queryResult: action.value};
        case QUERY_ACTIONS.SAVING_QUERY:
            return {...state, running: true, error: false};
        case QUERY_ACTIONS.QUERY_SAVED:
            return {...state, running: false, error: false, queryResult: action.value};
        case QUERY_ACTIONS.NAMESPACE_CHANGED:
            return {...state, namespace: action.value};
        case QUERY_ACTIONS.QUERY_NAME_CHANGED:
            return {...state, queryName: action.value};
        
        case QUERY_ACTIONS.TOGGLE_SAVE_MODAL:
            return {...state, showModal: !state.showModal};
        case QUERY_ACTIONS.TOGGLE_SIDEBAR:
            return {...state, showSidebar: !state.showSidebar};

        case QUERY_ACTIONS.NAMESPACES_LOADING:
            return {...state, loadingNamespaces: true, loadingQueries: true, namespaces: []}
        case QUERY_ACTIONS.NAMESPACES_LOADED:
            return {...state, loadingNamespaces: false, namespaces: action.value}
        case QUERY_ACTIONS.QUERIES_LOADING:
            return {...state, loadingQueries: true, namespace: action.value, queries: []}
        case QUERY_ACTIONS.QUERIES_LOADED:
            return {...state, loadingQueries: false, queries: action.value}
        case QUERY_ACTIONS.QUERY_LOADING:
            return {...state, query: '', queryResult: '', running: true}
        case QUERY_ACTIONS.QUERY_LOADED:
            return {...state, queryName: action.queryName, query: action.value, running: false, showSidebar: false }
        
        case QUERY_ACTIONS.LOAD_REVISIONS:
            return {...state, shouldLoadRevisions: true}

        case QUERY_ACTIONS.REVISIONS_LOADING:
            return {...state, running: true, shouldLoadRevisions: false, revisions: []}
        case QUERY_ACTIONS.REVISIONS_LOADED:
            return {...state, running: false, revisions: action.value }
        case QUERY_ACTIONS.INITIAL_STATE:
            return initialState;

        default:
            return state;
    }
};

export default queryReducer;

