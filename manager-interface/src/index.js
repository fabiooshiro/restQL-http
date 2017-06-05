import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import configureStore from './store/storeConfig';

import './index.css';

import QueryEditorScreen from './components/query/QueryEditorScreen';
import ResourcesEditorScreen from './components/resources/ResourcesEditorScreen';

const store = configureStore();
window.store = store;

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route path="/" exact={true} component={QueryEditorScreen} />
        <Route path="/resources-editor" exact={true} component={ResourcesEditorScreen} />
      </div>
    </Router>
  </Provider>,
  document.getElementById('root')
);
