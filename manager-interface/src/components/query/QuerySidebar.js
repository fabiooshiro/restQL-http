import React, { Component } from 'react';

import Sidebar from 'react-sidebar';

import Logo from '../restQL-logo.svg';
import SidebarQueries from './SidebarQueries';

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


export default class QuerySidebar extends Component {

	constructor(props) {
		super(props);
		this.index = 0;
	}

	renderNamespaces = () => {
		if(!this.props.loadingNamespaces) {
			let namespaces = this.props.namespaces.map((val, index)=>{
				if(val._id !== null && val._id.trim() !== '')
					return (
						<li key={index}>
							<a onClick={this.props.loadQueries.bind(this, val._id)}>{val._id}</a>
							<SidebarQueries loadingQueries={this.props.loadingQueries}
											queries={this.props.queries}
											namespace={val._id}
											collapsedNamespace={this.props.namespace}
											loadQuery={this.props.loadQuery} />
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
               		 onSetOpen={this.props.toggleSidebar}>
			
				{this.props.children}
			</Sidebar>
		);
	}

}
