import React from 'react';
import ReactDOM from 'react-dom';
import Root from './routes/Root';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/storeConfig';

import './index.css';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

window.store = store;

ReactDOM.render(
  <Root history={ history } store={ store } />,
  document.getElementById('root')
);
