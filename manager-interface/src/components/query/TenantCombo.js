// React
import React, { Component } from 'react';

import TenantOption from './TenantOption';
import ResourcesModal from './ResourcesModal';


export default class TenantCombo extends Component {

	renderOptions = () => {
      if(this.props.tenants.length > 0) {
        
        let options = [];
        const tenants = this.props.tenants;

        for(let i=0; i<tenants.length; i++) {
          	options.push(
				<TenantOption key={tenants[i]} value={tenants[i]} />
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
                    <select className="form-control" onChange={this.props.handleSetTenant}>
                        {options}
                    </select>

					<div>
						<a className="btn btn-default" 
							onClick={this.props.handleLoadResources}>
							Resources
						</a>
						<ResourcesModal show={this.props.show}
										toggleModal={this.props.toggleModal}
										tenant={this.props.tenant}
										resources={this.props.resources} />
					</div>
                </div>
				
			);
		}
		else
			return null;
	}
}
