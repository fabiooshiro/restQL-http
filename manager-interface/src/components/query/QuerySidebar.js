import React, { Component } from 'react';

import Sidebar from 'react-sidebar';
import { Collapse } from 'react-bootstrap';

// Redux actions
import { connect } from 'react-redux';
import { QUERY_ACTIONS } from '../../reducers/queryReducer';

import Logo from '../restQL-logo.svg';

// API Calls and processing
import { loadQueries, loadRevision, processResult } from '../../api/restQLAPI';


const styles = {
  overlay: {
    zIndex: 999,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity .5s ease-out, visibility .5s ease-out',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    transition: 'left .5s ease-out, right .5s ease-out',
  },
  sidebar: {
    zIndex: 1000,
    position: 'absolute',
    top: 0,
    bottom: 0,
    transition: 'transform .5s ease-out',
    WebkitTransition: '-webkit-transform .5s ease-out',
    willChange: 'transform',
    overflowY: 'auto',
	background: '#fff',
	paddingTop: 10,
	paddingLeft: 10,
	paddingRight: 20,
	width: 260,
  },

};


class QuerySidebar extends Component {

	constructor(props) {
		super(props);
		this.index = 0;
	}

	toggleSidebar = () => {
		this.props.dispatch({
			type: QUERY_ACTIONS.TOGGLE_SIDEBAR,
		});
	}

	loadQueries = (namespace) => {
		this.props.dispatch({
			type: QUERY_ACTIONS.QUERIES_LOADING,
			value: namespace
		});

		loadQueries(namespace, (response)=>{

			let result = processResult(response);

			if(result.error !== undefined) {
				this.props.dispatch({type: QUERY_ACTIONS.QUERIES_LOADED, value: []});
				alert('Error loading queries: ' + result.error);
			}
			else {
				this.props.dispatch({
					type: QUERY_ACTIONS.QUERIES_LOADED,
					value: result.queries
				});
			}

		});

		
	}

	loadQuery = (queryName, queryUrl) => {
		this.props.dispatch({
			type: QUERY_ACTIONS.QUERY_LOADING
		});

		loadRevision(queryUrl, (response)=>{
			if(response.error === null) {
				this.props.dispatch({
					type: QUERY_ACTIONS.QUERY_LOADED,
					queryName: queryName,
					value: response.body.text
				});
			}
			else {
				this.props.dispatch({
					type: QUERY_ACTIONS.QUERY_ERROR,
					value: response.body.text
				});
			}
			
		})
	}

	renderNamespaces = () => {
		if(!this.props.loadingNamespaces) {
			let namespaces = this.props.namespaces.map((val, index)=>{
				if(val._id !== null && val._id.trim() !== '')
					return (
						<li key={index}>
							<a onClick={() => this.loadQueries(val._id)}>{val._id}</a>
							<ul className="queries">
								<Collapse in={!this.props.loadingQueries}>
									<div>
									{
										this.props.namespace === val._id  ? 
										this.renderQueries() : ''
									}
									</div>
								</Collapse>
							</ul>
						</li>
					);
				else
					return ''
			});

			return (
				<ul className="namespaces">
					{namespaces}
				</ul>
			);
		}
		else {
			return (
				<p>Loading</p>
			);
		}
	}
	
	renderQueries = () => {
		if(!this.props.loadingQueries && Array.isArray(this.props.queries)) {
			return this.props.queries.map((val, index) => {
				return (
					<li key={index}>
						<a onClick={() => this.loadQuery(val.id, val['last-revision'])}>{val.id}</a>
					</li>
				);
			});
		}
		else {
			return '';
		}
	}

	render() {
		const sidebarContent = (
			<div>
				<object data={Logo} type="image/svg+xml" className="logo">
					<img src={Logo} alt="Logo" className="logo" />
				</object>

				<div className="menu">
					{this.renderNamespaces()}
				</div>
			</div>
		);

		return (
			<Sidebar styles={styles}
					 sidebar={sidebarContent}
               		 open={this.props.showSidebar}
               		 onSetOpen={this.toggleSidebar}>
			
				{this.props.children}
			</Sidebar>
		);
	}

}

const mapStateToProps = (state, ownProps) => ({
    loadingNamespaces: state.queryReducer.loadingNamespaces,
	loadingQueries: state.queryReducer.loadingQueries,
	
	showSidebar: state.queryReducer.showSidebar,
	namespaces: state.queryReducer.namespaces,
	namespace: state.queryReducer.namespace,
	queries: state.queryReducer.queries,
});

export default connect(mapStateToProps, null)(QuerySidebar);