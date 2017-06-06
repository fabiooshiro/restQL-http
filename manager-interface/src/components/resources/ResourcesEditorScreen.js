// React
import React, { Component } from 'react';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.css';

import { Row, Col } from 'react-bootstrap';

// Redux actions
import { connect } from 'react-redux';

import { getRuntimeTarget } from '../../api/restQLAPI';

// Application Logic
import {
    handleActiveTenant,
    handleLoadTenants,
    handleLoadResources,
} from '../../actions/environmentActionCreator';

// CSS for this screen and logo
import './ResourcesEditorScreen.css';
import Logo from '../restQL-logo.svg';

// Application components
import ResourcesNavbar from './ResourcesNavbar';
import ResourcesMenu from './ResourcesMenu';
import ResourcesEditor from './ResourcesEditor';

class ResourcesEditorScreen extends Component {
  
  constructor(props) {
    super(props);

    if(this.props.tenants.length === 0)
        handleLoadTenants();
  }

  render() {

    return (
        <div>
            <ResourcesNavbar logo={Logo}
                             queryEditorLink={'/?targetRuntime=' +  getRuntimeTarget()} />

            <Row>
                <Col xs={4} md={2}>
                    <ResourcesMenu
                        className="resourcesMenu"
                        handleActiveTenant={handleActiveTenant}
                        activeTenant={this.props.activeTenant}
                        tenants={this.props.tenants}
                        tenant={this.props.tenant}
                        resources={this.props.resources} />
                </Col>

                <Col xs={8} md={10}>
                    <ResourcesEditor
                        tenant={this.props.tenant}
                        resources={this.props.resources} />
                </Col>
            </Row> 
        </div>
    );

  }

}

const mapStateToProps = (state, ownProps) => ({
    // Env configurations
    tenants: state.environmentReducer.tenants,
    tenant: state.environmentReducer.tenant,
    activeTenant: state.environmentReducer.activeTenant,
    resources: state.environmentReducer.resources,
});

export default connect(mapStateToProps, null)(ResourcesEditorScreen);