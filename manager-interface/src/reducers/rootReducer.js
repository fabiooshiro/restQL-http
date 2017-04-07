import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import queryReducer from './queryReducer';

const rootReducer = combineReducers({
  routing,
  queryReducer,
});

export default rootReducer;
