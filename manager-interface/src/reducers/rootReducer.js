import { combineReducers } from 'redux';

import queryReducer from './queryReducer';
import environmentReducer from './environmentReducer';

const rootReducer = combineReducers({
  environmentReducer,
  queryReducer,
});

export default rootReducer;
