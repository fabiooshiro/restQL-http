// React
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import TenantOption from './TenantOption';

export default class TenantCombo extends Component {

	renderOptions = () => {
      if(this.props.tenants.length > 0) {
        
        let options = [];
        const tenants = this.props.tenants;

        for(let i=0; i<tenants.length; i++) {
          	options.push(
				<TenantOption activeTenant={this.props.activeTenant}
							  key={i}
							  value={i}
							  text={tenants[i]} />
			)
        }

        return options;
      }
	}

	render() {
		if (this.props.tenants.length > 0) {
			const options = this.renderOptions();

			return (
                <div className={this.props.className}>
                    <label>Tenant</label>
                    <select className="form-control"
							onChange={this.props.handleSetTenant}
							value={this.props.activeTenant}>
                        {options}
                    </select>

					<div>
						<Link to={this.props.resourcesLink}
							  className="btn btn-md btn-default">
							Resources
						</Link>
					</div>
                </div>
				
			);
		}
		else
			return null;
	}
}
