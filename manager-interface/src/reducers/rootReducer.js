import { combineReducers } from 'redux';

import queryReducer from './queryReducer';

const rootReducer = combineReducers({
  queryReducer,
});

export default rootReducer;
