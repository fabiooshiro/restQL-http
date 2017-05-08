// React
import React, { Component } from 'react';

import RevisionOption from './RevisionOption';


export default class RevisionCombo extends Component {

	renderOptions = () => {
		if(this.props.revisions.length > 0) {
        let options = [];

        for(let i=this.props.revisions.length; i>0; i--) {
          	options.push(
				<RevisionOption key={i} revisionIndex={i} />
			)
        }

        return options;
      }
	}

	render() {
		if (this.props.toggle) {
			const options = this.renderOptions();

			return (
				<select className="revisionPicker" onChange={this.props.handleLoadQueryRevision}>
					{options}
				</select>
			);
		}
		else
			return null;
	}
}

