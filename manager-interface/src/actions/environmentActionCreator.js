/**
 * Every action related to the environment
 * operations is centralized here.
 */

// Redux actions
import { ENVIRONMENT_ACTIONS } from '../reducers/environmentReducer';

import { loadTenants, loadResourcesFromTenant } from '../api/restQLAPI';

export function toggleResourcesModal() {
	window.store.dispatch({type: ENVIRONMENT_ACTIONS.TOGGLE_RESOURCES_MODAL});
}

export function handleLoadTenants() {
  const store = window.store;
  const dispatch = store.dispatch;

	loadTenants((result)=>{
		const tenants = (result.body ? result.body.tenants : []);

		if(!result.error && tenants.length > 0) {
			dispatch({type: ENVIRONMENT_ACTIONS.LOAD_TENANTS, value: tenants});
			dispatch({type: ENVIRONMENT_ACTIONS.SET_TENANT, value: tenants[0]})
		}
		else {
			dispatch({type: ENVIRONMENT_ACTIONS.LOAD_TENANTS, value: []});
		}
	});
}

export function handleSetTenant(evt) {
	window.store.dispatch({type: ENVIRONMENT_ACTIONS.SET_TENANT, value: evt.target.value});
}

export function handleLoadResources(evt) {
	const store = window.store;
  	const dispatch = store.dispatch;

	const tenant = store.getState().environmentReducer.tenant;

	dispatch({type: ENVIRONMENT_ACTIONS.CLEAR_RESOURCES});

	toggleResourcesModal();

	loadResourcesFromTenant(tenant, (result)=>{
		const resources = (result.body ? result.body.resources : []);
		dispatch({type: ENVIRONMENT_ACTIONS.LOAD_RESOURCES, value: resources});
	});
}