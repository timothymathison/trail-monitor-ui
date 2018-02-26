import React, {Component} from 'react';

import ControlToggle from './ControlToggle'

class ControlPanel extends Component {

	render() {
		return(
			<div id="control-panel" className="flexDefault">
				<ControlToggle label="Display Data" type="on-off" value={this.props.displayAll} handler={this.props.displayAllHandler}/>
				{/*TODO: Add map legend*/}
				{/*TODO: Add time selector*/}
				{/*TODO: Add datatype selector*/}
			</div>
		);
	}
}

export default ControlPanel;
