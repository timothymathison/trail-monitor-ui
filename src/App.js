import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import Utility from './Utility.js';
import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js';
import LoadIcon from './LoadIcon'

const emptyTrailPoints = {
	type: "geojson",
	data: {
		type: "FeatureCollection",
		features: []
	}
};

class App extends Component {
	updateQueued = false;
	updateMapParams = {};

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
			timespan: "allTime",
			trailPointData: emptyTrailPoints
		};
		// Utility.requestData(46, -93, -91, 45, 0, this.newDataHandler);
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

	//set params for the data that needs to be displayed on map
	updateMapHandler = (top, bot, left, right) => {
		//TODO: find time
		this.updateMapParams = {
			top: top,
			bot: bot,
			left: left,
			right: right
		};
		if(!this.state.isLoading) {
			this.updateMapData();
		} else if(!this.updateQueued){ //if already loading, wait before updating again
			setTimeout(this.updateMapData, 500);
			this.updateQueued = true;
		}

	};

	//check if data is present for all of current view window; if not, request new data from cloud service
	updateMapData = () => {
		if(this.state.isLoading) {
			setTimeout(this.updateMapData, 500)
		} else {
			this.setState({ isLoading: true });
			Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
				this.updateMapParams.bot, 0, this.newDataHandler);
		}
	};

	newDataHandler = (msg, geoJson) => {
		if(geoJson === null) {
			alert(msg);
			this.setState({ displayAll: false, isLoading: false });
		} else if(geoJson.data && geoJson.data.type === "FeatureCollection") {
			this.setState({
				trailPointData: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: geoJson.data.features
						}
				},
				displayAll: true,
				isLoading: false
			})
		} else {
			this.setState({ displayAll: false, isLoading: false });
			console.error("Invalid data fetched by request");
			alert("Unable to display data");
		}
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
