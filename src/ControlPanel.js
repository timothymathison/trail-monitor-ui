import React, {Component} from 'react';

import ControlToggle from './ControlToggle'

class ControlPanel extends Component {

	render() {
		return(
			<div id="control-panel" className="flexDefault">
				<ControlToggle label="Map Type" type="select" value={this.props.topoMap} handler={this.props.mapTypeHandler}
				               innerLabels={["Topo", "Dark"]} colors={["#2dcc70", "#414244"]}/>
				<ControlToggle label="Display Data" type="on-off" value={this.props.displayAll} handler={this.props.displayAllHandler}/>
				<ControlToggle label="Roughness/Density" type="select" value={true} handler={ () => {} }
				               innerLabels={["R", "D"]} colors={["#e84c3d", "#2a57ab"]}/>
				{/*TODO: Add map legend*/}
				{/*TODO: Add time selector*/}
				{/*TODO: Add force refresh button*/}
			</div>
		);
	}
}

export default ControlPanel;
