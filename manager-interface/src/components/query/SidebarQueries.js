import React, { Component } from 'react';

import { Collapse } from 'react-bootstrap';


export default class SidebarQueries extends Component {
    
    renderQueries = () => {
		if(!this.props.loadingQueries && Array.isArray(this.props.queries)) {
			return this.props.queries.map((val, index) => {
				return (
					<li key={index}>
						<a onClick={this.props.loadQuery.bind(this, val)}>{val.id}</a>
					</li>
				);
			});
		}
		else {
			return '';
		}
	}

    render() {
        const shouldCollapse = this.props.namespace === this.props.collapsedNamespace && !this.props.loadingQueries;

        return (
            <ul className="queries">
                <Collapse in={shouldCollapse}>
                    <div>
                    {
                        shouldCollapse  ? 
                        this.renderQueries() : null
                    }
                    </div>
                </Collapse>
            </ul>
        );
    }

}