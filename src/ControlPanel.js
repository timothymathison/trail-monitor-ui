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
		let mapContainer = document.getElementById("map-container"); //get map container
		if(this.state.open) {
			this.setState({ open: false });
			mapContainer.removeEventListener("click", this.toggleOpen) //remove event listener when panel is closed
		} else {
			this.setState({ open: true });
            mapContainer.addEventListener("click", this.toggleOpen); //add event listener so panel will close when map is clicked
		}
	};

	//attempt at fixing issue with iphone launching keyboard when select clicked
    // componentDidMount() {
    // 	let input = document.getElementById("control-panel").getElementsByClassName("select")[0].getElementsByTagName("input")[0];
    // 	input.readonly = true;
    // 	// input.disabled = true;
    //     console.log(input);
    // }

	render() {
		return(
			<div id="control-panel" className={"flexDefault" + (this.state.open ? " open-panel" : " hidden-panel")}>
				<Button id="open-close-panel" className={this.state.open ? "up" : "down"} handler={this.toggleOpen} symbol={Arrow}/>
				<ControlToggle label="Map Type" type="select" value={this.props.topoMap} handler={this.props.mapTypeHandler}
				               innerLabels={["Topo", "Dark"]} colors={["#00b894", "#2d3436"]}/>
				<ControlToggle label="Show All Data" type="on-off" value={this.props.displayAll} handler={this.props.displayAllHandler}/>
				<ControlToggle label="Cache Data" type="on-off" value={this.props.cacheData} handler={this.props.cacheDataHandler}/>
                <SelectOptions handler={this.props.timeHandler} options={this.props.timeOptions} default={this.props.timeOptions[4]}/>
				<ControlToggle label="Display Type" type="select" value={this.props.displayPoints} handler={this.props.displayPointsHandler}
				               innerLabels={["point", "line"]} colors={["#d63031", "#0984e3"]}/>
				<ControlToggle label="Data Source" type="select" value={this.props.displayRoughness} handler={this.props.displayRoughnessHandler}
				               innerLabels={["rough", "traffic"]} colors={["#cc3232", "#223B89"]}/>
				<Button handler={this.props.refreshHandler} text="Refresh"/>
				<AlertBox alertId={this.props.alert.id} type={this.props.alert.type} message={this.props.alert.message} timeout={this.props.alert.timeout}/>
			</div>
		);
	}
}

export default ControlPanel;
