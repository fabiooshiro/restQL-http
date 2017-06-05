// Initial state
export const initialState = {
    tenant: null,
    tenants: [],
    resources: [],
    activeTenant: 0,
};

// Enum for query actions
export const ENVIRONMENT_ACTIONS = {
    INITIAL_STATE: 'ENV_INITIAL_STATE',

    LOAD_TENANTS: 'LOAD_TENANTS',
    SET_TENANT: 'SET_TENANT',
    LOAD_RESOURCES: 'LOAD_RESOURCES',
    CLEAR_RESOURCES: 'CLEAR_RESOURCES',

    SET_ACTIVE_TENANT: 'SET_ACTIVE_TENANT',
};

const environmentReducer = (state = initialState, action) => {
    switch (action.type) {
        case ENVIRONMENT_ACTIONS.LOAD_TENANTS:
            return {...state, tenants: action.value};
        case ENVIRONMENT_ACTIONS.SET_TENANT:
            return {...state, tenant: action.value};
        case ENVIRONMENT_ACTIONS.LOAD_RESOURCES:
            return {...state, resources: action.value };
        case ENVIRONMENT_ACTIONS.CLEAR_RESOURCES:
            return {...state, resources: []};

        case ENVIRONMENT_ACTIONS.INITIAL_STATE:
            return initialState;

        case ENVIRONMENT_ACTIONS.SET_ACTIVE_TENANT:
            return {...state, activeTenant: action.value };

        default:
            return state;
    }
};

export default environmentReducer;

