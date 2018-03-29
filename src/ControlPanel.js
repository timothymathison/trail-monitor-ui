import React, {Component} from 'react';
import Arrow from './arrow.svg'

import ControlToggle from './ControlToggle';
import SelectOptions from './SelectOptions';
import Button from './Button';
import AlertBox from './AlertBox';

class ControlPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
	}

	//on smaller devices, control panel can be opened and closed/hidden
	toggleOpen = () => {
		if(this.state.open) {
			this.setState({ open: false });
		} else {
			this.setState({ open: true });
		}
	};

	render() {
		//TODO
		return(
			<div id="control-panel" className={"flexDefault" + (this.state.open ? "" : " hidden-panel")}>
				<Button id="open-close-panel" className={this.state.open ? "up" : "down"} handler={this.toggleOpen} symbol={Arrow}/>
				<ControlToggle label="Map Type" type="select" value={this.props.topoMap} handler={this.props.mapTypeHandler}
				               innerLabels={["Topo", "Dark"]} colors={["#2dcc70", "#414244"]}/>
				<ControlToggle label="Display Data" type="on-off" value={this.props.displayAll} handler={this.props.displayAllHandler}/>
				<ControlToggle label="Cache Data" type="on-off" value={this.props.cacheData} handler={this.props.cacheDataHandler}/>
				<ControlToggle label="Roughness/Density" type="select" value={true} handler={ () => {} }
				               innerLabels={["R", "D"]} colors={["#e84c3d", "#2a57ab"]}/>
				<SelectOptions handler={this.props.timeHandler} options={this.props.timeOptions} default={this.props.timeOptions[4]}/>
				{/*TODO: Add map legend*/}
				<Button handler={this.props.refreshHandler} text="Refresh"/>
				<AlertBox alertId={this.props.alert.id} type={this.props.alert.type} message={this.props.alert.message} timeout={this.props.alert.timeout}/>
			</div>
		);
	}
}

export default ControlPanel;
