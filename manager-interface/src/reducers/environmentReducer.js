// Initial state
export const initialState = {
    tenant: null,
    tenants: [],
    resources: [],
    activeTenant: 0,

    showSaveResourceModal: false,
    activeResource: null,
    authorizationKey: '',
    resourceUpdated: false,
    updateMessage: null,
};

// Enum for query actions
export const ENVIRONMENT_ACTIONS = {
    INITIAL_STATE: 'ENV_INITIAL_STATE',

    LOAD_TENANTS: 'LOAD_TENANTS',
    SET_TENANT: 'SET_TENANT',
    LOAD_RESOURCES: 'LOAD_RESOURCES',
    CLEAR_RESOURCES: 'CLEAR_RESOURCES',

    SET_ACTIVE_TENANT: 'SET_ACTIVE_TENANT',
    
    TOGGLE_RESOURCE_MODAL: 'TOGGLE_RESOURCE_MODAL',
    SET_ACTIVE_RESOURCE: 'SET_ACTIVE_RESOURCE',
    RESOURCE_NAME_CHANGED: 'RESOURCE_NAME_CHANGED',
    RESOURCE_URL_CHANGED: 'RESOURCE_URL_CHANGED',

    AUTHORIZATION_KEY_CHANGED: 'AUTHORIZATION_KEY_CHANGED',
    UPDATE_RESOURCE_ERROR: 'UPDATE_RESOURCE_ERROR',
    UPDATE_RESOURCE_SUCCESS: 'UPDATE_RESOURCE_SUCCESS',
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
        
        case ENVIRONMENT_ACTIONS.TOGGLE_RESOURCE_MODAL:
            return {...state, updateMessage: null, showSaveResourceModal: !state.showSaveResourceModal};
        case ENVIRONMENT_ACTIONS.SET_ACTIVE_RESOURCE:
            return {...state, activeResource: action.value};
        case ENVIRONMENT_ACTIONS.RESOURCE_NAME_CHANGED:
            return {...state, activeResource: {...state.activeResource, name: action.value} }
        case ENVIRONMENT_ACTIONS.RESOURCE_URL_CHANGED:
            return {...state, activeResource: {...state.activeResource, url: action.value} }
        case ENVIRONMENT_ACTIONS.AUTHORIZATION_KEY_CHANGED:
            return {...state, authorizationKey: action.value};
        case ENVIRONMENT_ACTIONS.UPDATE_RESOURCE_ERROR:
            return {...state, updateMessage: action.value, resourceUpdated: false};
        case ENVIRONMENT_ACTIONS.UPDATE_RESOURCE_SUCCESS:
            return {...state, updateMessage: action.value, resourceUpdated: true};
        default:
            return state;
    }
};

export default environmentReducer;

