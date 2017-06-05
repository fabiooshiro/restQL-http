import React, { Component } from 'react';

import {Row, Col} from 'react-bootstrap';

export default class ResourcesEditor extends Component {

    mapResources = (res, className) => {
        return (
            <li key={res.name}>
                <p className={className}>
                    {res.name} - {res.status || 'ERROR'}
                </p>
                <p className="resource-url">{res.url}</p>
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
                </Row>
            );
                
        }
        else
            return (<p>Fetching data...</p>);
    }

}