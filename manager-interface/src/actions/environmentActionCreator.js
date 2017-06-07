/**
 * Every action related to the environment
 * operations is centralized here.
 */

// Redux actions
import { ENVIRONMENT_ACTIONS } from '../reducers/environmentReducer';

import { loadTenants, loadResourcesFromTenant, updateResource } from '../api/restQLAPI';

const store = require('../store/storeConfig').store;

export function handleActiveTenant(tenantKey) {
	const dispatch = store.dispatch;

	const tenants = store.getState().environmentReducer.tenants;
	
	dispatch({type: ENVIRONMENT_ACTIONS.SET_ACTIVE_TENANT, value: tenantKey});
	dispatch({type: ENVIRONMENT_ACTIONS.SET_TENANT, value: tenants[tenantKey]});

	handleLoadResources(null);
}

export function handleLoadTenants() {
  const dispatch = store.dispatch;

	loadTenants((result)=>{
		const tenants = (result.body ? result.body.tenants : []);

		if(!result.error && tenants.length > 0) {
			dispatch({type: ENVIRONMENT_ACTIONS.LOAD_TENANTS, value: tenants});
			dispatch({type: ENVIRONMENT_ACTIONS.SET_ACTIVE_TENANT, value: 0});
			dispatch({type: ENVIRONMENT_ACTIONS.SET_TENANT, value: tenants[0]});
		}
		else {
			dispatch({type: ENVIRONMENT_ACTIONS.LOAD_TENANTS, value: []});
		}
	});
}

export function handleSetTenant(evt) {

	const { tenants } = window.store.getState().environmentReducer;

	store.dispatch({type: ENVIRONMENT_ACTIONS.SET_ACTIVE_TENANT, value: evt.target.value});
	store.dispatch({type: ENVIRONMENT_ACTIONS.SET_TENANT, value: tenants[evt.target.value]});

	handleActiveTenant(evt.target.value);
}

export function handleLoadResources() {
	const dispatch = store.dispatch;

	const { tenants, tenant, activeTenant } = store.getState().environmentReducer;

	const currentTenant = (tenant !== null ? tenant : tenants[activeTenant]);

	dispatch({type: ENVIRONMENT_ACTIONS.CLEAR_RESOURCES});

	loadResourcesFromTenant(currentTenant, (result)=>{
		const resources = (result.body ? result.body.resources : []);
		dispatch({type: ENVIRONMENT_ACTIONS.LOAD_RESOURCES, value: resources});
	});
}

export function setActiveResourceAndToggleModal(resource){
	store.dispatch({
		type: ENVIRONMENT_ACTIONS.SET_ACTIVE_RESOURCE,
		value: resource
	});
	handleToggleSaveResourceModal();
}

export function handleToggleSaveResourceModal(){
	store.dispatch({type: ENVIRONMENT_ACTIONS.TOGGLE_RESOURCE_MODAL});
}

export function handleResourceNameChanged(evt) {
	store.dispatch({type: ENVIRONMENT_ACTIONS.RESOURCE_NAME_CHANGED, value: evt.target.value});
}

export function handleResourceUrlChanged(evt){
	store.dispatch({type: ENVIRONMENT_ACTIONS.RESOURCE_URL_CHANGED, value: evt.target.value});
}

export function handleAuthorizationKeyChanged(evt) {
	store.dispatch({type: ENVIRONMENT_ACTIONS.AUTHORIZATION_KEY_CHANGED, value: evt.target.value});
}

export function handleSaveResource(){

	const { authorizationKey, tenant, activeResource } = store.getState().environmentReducer;

	updateResource(authorizationKey, tenant, activeResource, (result) => {
		
		if(result !== undefined && result.error !== undefined && result.error !== null) {
			store.dispatch({type: ENVIRONMENT_ACTIONS.UPDATE_RESOURCE_ERROR, value: result.error.message});
		}
		else {
			store.dispatch({type: ENVIRONMENT_ACTIONS.UPDATE_RESOURCE_SUCCESS, value: 'Resource updated!'});
			handleLoadResources();
		}
	});
	
}