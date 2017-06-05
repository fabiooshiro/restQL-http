import { createStore } from 'redux';
import rootReducer from '../reducers/rootReducer';

export const store = configureStore({});

export function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
  );
}

