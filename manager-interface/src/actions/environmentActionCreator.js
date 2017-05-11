/**
 * Every action related to the environment
 * operations is centralized here.
 */

// Redux actions
import { ENVIRONMENT_ACTIONS } from '../reducers/environmentReducer';

import { loadTenants } from '../api/restQLAPI';

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