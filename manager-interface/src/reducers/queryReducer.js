// Initial state
export const initialState = {
    query: '',
    running: false,
    error: false,
    queryResult: '',
};

// Enum for query actions
export const QUERY_ACTIONS = {
    READ_QUERY: 'READ_QUERY',
    RUNNING_QUERY: 'RUNNING_QUERY',
    QUERY_ERROR: 'QUERY_ERROR',
    QUERY_SUCCESS: 'QUERY_SUCCESS',
    SAVING_QUERY: 'SAVING_QUERY',
    QUERY_SAVED: 'QUERY_SAVED'
};

const queryReducer = (state = initialState, action) => {
    switch (action.type) {
        case QUERY_ACTIONS.READ_QUERY:
            return {...state, query: action.value};
        case QUERY_ACTIONS.RUNNING_QUERY:
            return {...state, running: true, error: false, queryResult: null};
        case QUERY_ACTIONS.QUERY_ERROR:
            return {...state, running: false, error: true, queryResult: action.value};
        case QUERY_ACTIONS.QUERY_SUCCESS:
            return {...state, running: false, error: false, queryResult: action.value};
        case QUERY_ACTIONS.SAVING_QUERY:
            return {...state, running: true, error: false};
        case QUERY_ACTIONS.QUERY_SAVED:
            return {...state, running: false, error: false, queryResult: action.value};
        default:
            return state;
    }
};

export default queryReducer;

