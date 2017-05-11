// Initial state
export const initialState = {
    tenant: null,
    tenants: [],
};

// Enum for query actions
export const ENVIRONMENT_ACTIONS = {
    INITIAL_STATE: 'INITIAL_STATE',

    LOAD_TENANTS: 'LOAD_TENANTS',
    SET_TENANT: 'SET_TENANT',
};

const environmentReducer = (state = initialState, action) => {
    switch (action.type) {
        case ENVIRONMENT_ACTIONS.LOAD_TENANTS:
            return {...state, tenants: action.value};
        case ENVIRONMENT_ACTIONS.SET_TENANT:
            return {...state, tenant: action.value};
            
        case ENVIRONMENT_ACTIONS.INITIAL_STATE:
            return initialState;

        default:
            return state;
    }
};

export default environmentReducer;

