import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import Utility from './Utility.js';
import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js';
import LoadIcon from './LoadIcon'

class App extends Component {
	cache = {
		pastDay: {},
		pastWeek: {},
		pastMonth: {},
		pastYear: {},
		allTime: {}
	}; //TODO: dynamicaly manage data and when it needs to be fetched

	constructor(props) {
		super(props);
		this.state = {
			displayAll: false,
			topoMap: false,
			isLoading: true,
			trailPointData: Utility.buildData()
		};
		Utility.requestData(46, -93, -91, 45, 0, this.newDataHandler);
	}

	//turns all data display on/off
	displayAllHandler = (newValue) => {
		this.setState({ displayAll: newValue });
		console.log("Display data value: " + newValue);
	};

	//toggles the style of map - topographic or dark
	mapTypeHandler = (newValue) => {
		this.setState({ topoMap: newValue });
	};

	//check if data is present for all of current view window; if not, request new data from cloud service
	updateMapHandler = (top, bot, left, right) => {

	};

	newDataHandler = (msg, geoJson) => {

	};

	loading = () => {
		this.setState({ isLoading: true });
	};

	notLoading = () => {
		this.setState({ isLoading: false });
	};

	render() {
		return (
            <div id="App">
                <header id="App-header">
                    <img src={polaris} id="polaris-logo" alt="polaris-logo"/>
                    <h1 className="App-title">Trail Monitor</h1>
                    <img src={logo} id="react-logo" alt="react-logo"/>

                </header>
	            <div id="App-body">
		            <ControlPanel displayAll={this.state.displayAll} displayAllHandler={this.displayAllHandler}
		                          topoMap={this.state.topoMap} mapTypeHandler={this.mapTypeHandler}
		            />
		            <MapDisplay dataType="trailRoughness" trailPointData={this.state.trailPointData}
		                        dataVisible={this.state.displayAll} topoMap={this.state.topoMap}
		                        updateHandler={this.updateMapHandler}
		            />
	            </div>
				<LoadIcon isLoading={this.state.isLoading}/>
            </div>
		);
	}
}

export default App;
