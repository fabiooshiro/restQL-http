// React
import React, { Component } from 'react';

export default class RevisionOption extends Component {

  render() {
    return (
      <option value={this.props.revisionIndex} >
        {this.props.revisionIndex}
      </option>
    );
  }
}
