import React, {Component} from 'react';

import ControlToggle from './ControlToggle'

class ControlPanel extends Component {
	constructor(props) {
		super(props);
		// this.state = {
		// 	displayAll: props.displayAll
		// }
	}

	// componentWillReceiveProps(newProps) {
	// 	this.setState({ displayAll: newProps.displayAll });
	// }
	//
	// shouldComponentUpdate(newProps, newState) {
	// 	return newProps.displayAll !== this.state.displayAll;
	// }

	render() {
		return(
			<div id="control-panel" className="flexDefault">
				<ControlToggle label="Display Data" value={this.props.displayAll} handler={this.props.displayAllHandler}/>
			</div>
		);
	}
}

export default ControlPanel;
