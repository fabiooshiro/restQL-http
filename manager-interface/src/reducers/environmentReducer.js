// Initial state
export const initialState = {
    tenant: null,
    tenants: [],
    resources: [],
    showResourcesModal: false,
};

// Enum for query actions
export const ENVIRONMENT_ACTIONS = {
    INITIAL_STATE: 'ENV_INITIAL_STATE',

    LOAD_TENANTS: 'LOAD_TENANTS',
    SET_TENANT: 'SET_TENANT',
    LOAD_RESOURCES: 'LOAD_RESOURCES',
    CLEAR_RESOURCES: 'CLEAR_RESOURCES',

    TOGGLE_RESOURCES_MODAL: 'TOGGLE_RESOURCES_MODAL',
};

const environmentReducer = (state = initialState, action) => {
    switch (action.type) {
        case ENVIRONMENT_ACTIONS.LOAD_TENANTS:
            return {...state, tenants: action.value};
        case ENVIRONMENT_ACTIONS.SET_TENANT:
            return {...state, tenant: action.value};
        case ENVIRONMENT_ACTIONS.LOAD_RESOURCES:
            return {...state, resources: action.value };

        case ENVIRONMENT_ACTIONS.TOGGLE_RESOURCES_MODAL:
            return {...state, showResourcesModal: !state.showResourcesModal}
        case ENVIRONMENT_ACTIONS.CLEAR_RESOURCES:
            return {...state, resources: []};

        case ENVIRONMENT_ACTIONS.INITIAL_STATE:
            return initialState;

        default:
            return state;
    }
};

export default environmentReducer;

