import React, { Component } from 'react';

import {Row, Col, Button} from 'react-bootstrap';
import 'font-awesome/css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';

import SaveResourceModal from './SaveResourceModal';

export default class ResourcesEditor extends Component {

    mapResources = (res, className) => {
        return (
            <li key={res.name}>
                <p className={className}>
                    {res.name} - {res.status || 'ERROR'}
                </p>
                <p className="resource-url">
                    {res['url']}
                    <Button className="btn-xs"
                            bsStyle="success"
                            onClick={() => this.props.setActiveResourceAndToggleModal(res)}>
                        <FontAwesome name="pencil" />
                    </Button>
                </p>
            </li>
        );
    }

    render() {
        if(this.props.resources.length > 0) {
            const resourceSuccessList = this.props.resources
                .filter((res) => res.status === 200)
                .map((res) => this.mapResources(res, 'status-success'));

            const resourceErrorList = this.props.resources
                .filter((res) => res.status !== 200)
                .map((res) => this.mapResources(res, 'status-error'));

            return (
                <Row>
                    <h1>{this.props.tenant}</h1>
                    <hr />
                     
                    <Col sm={12} md={6}>
                        <h4>Reachable Resources</h4>
                        <hr/>
                        <ul>{resourceSuccessList}</ul>
                    </Col>
                    
                    <Col sm={12} md={6}>
                        <h4>Unreachable Resources</h4>
                        <hr/>
                        <ul>{resourceErrorList}</ul>
                    </Col>

                    <SaveResourceModal authorizationKey={this.props.authorizationKey}
                                       activeResource={this.props.activeResource}
                                       tenant={this.props.tenant}
                                       toggleModal={this.props.handleToggleSaveResourceModal}
                                       show={this.props.showSaveResourceModal}
                                       resourceUpdated={this.props.resourceUpdated}
                                       updateMessage={this.props.updateMessage}
                                       handleAuthorizationKeyChanged={this.props.handleAuthorizationKeyChanged}
                                       handleResourceNameChanged={this.props.handleResourceNameChanged}
                                       handleResourceUrlChanged={this.props.handleResourceUrlChanged}
                                       handleSave={this.props.handleSaveResource} />
                </Row>
            );
                
        }
        else
            return (
                <Row>
                    <h1>No tenant</h1>
                    <hr />
                    <Col xs={12}>
                        <p>Fetching data...</p>
                    </Col>
                </Row>
            );
    }

}