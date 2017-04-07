import React from 'react'
import { Route } from 'react-router'
import App from '../components/App';
import QueryEditorScreen from '../components/query/QueryEditorScreen';

export default (
    <Route name="bridge" component={App}>
        <Route name="index" path="/" component={QueryEditorScreen} />
    </Route>
);