import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import Utility from './Utility.js';
import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js';
import LoadIcon from './LoadIcon'

const millisecTimes = {
	day: 86400000, //24 hours
	week: 604800000, //7 days
	month: 2592000000, //30 days
	year: 31536000000 //365 days
};

const emptyTrailPoints = {
	type: "geojson",
	data: {
		type: "FeatureCollection",
		features: []
	}
};

const timeOptions = [
	{value: "pastDay", label: "Past 24 Hours"},
	{value: "pastWeek", label: "Past 7 Days"},
	{value: "pastMonth", label: "Past 30 Days"},
	{value: "pastYear", label: "Past Year"},
	{value: "allTime", label: "All Time"}
];
const defaultTimeSpan = timeOptions[4].value;

//cache names MUST BE SAME as time option values above
const emptyCache = {
	pastDay: {
		tileIds: []
	},
	pastWeek: {
		tileIds: []
	},
	pastMonth: {
		tileIds: []
	},
	pastYear: {
		tileIds: []
	},
	allTime: {
		tileIds: []
	}
};

class App extends Component {
	updateQueued = false;
	updateMapParams = {};
	tileIdOfLoading = [];
	timeSpan = defaultTimeSpan;
	cache = emptyCache;

	constructor(props) {
		super(props);
		this.state = {
			displayAll: false,
			topoMap: false,
			isLoading: false,
			cacheData: true,
			trailPointData: emptyTrailPoints,
			dataVersion: 0
		};
	}

    //toggles the style of map - topographic or dark
    mapTypeHandler = (newValue) => {
        this.setState({ topoMap: newValue });
    };

	//turns all data display on/off
	displayAllHandler = (newValue) => {
		if(this.state.trailPointData.data.features.length > 0) {
			this.setState({ displayAll: newValue });
		} else {
			this.setState({ displayAll: false });
			alert("There is currently no data to display\nPlease change the map or view area")
		}
	};

	//toggles whether data is cached
	cacheDataHandler = (newValue) => {
		if(newValue) { //if data should be cached, add current map data to cache
			this.updateCache(this.timeSpan, this.state.trailPointData.data.features)
		} else {
			this.cache = emptyCache; //empty the cache
		}
		this.setState({ cacheData: newValue });
	};

	//changes the time-span for which data is displayed on map
	timeChangeHandler = (newTimeSpan) => {
		console.log("Time: ", newTimeSpan, "selected");
		if(this.state.cacheData) { //remove old timespan data from map and update status in cache
			let cache = this.cache[this.timeSpan];
			for(let i = 0; i < cache.tileIds.length; i++) {
				cache[cache.tileIds[i]].onMap = false;
			}
		}
		this.timeSpan = newTimeSpan;
		this.setState({ trailPointData: emptyTrailPoints }, this.updateMapData); //set empty map data and update for new time
	};

	//when refresh button is clicked, empty cache and request new data
	refreshHandler = () => {
		console.log("Refresh data clicked");
	};

	//TODO: custom alert box

	//set params for the data that needs to be displayed on map
	updateMapHandler = (top, bot, left, right, zoom) => {
		if(this.updateMapParams.zoom !== zoom || this.updateMapParams.top !== top || this.updateMapParams.bot !== bot
			|| this.updateMapParams.left !== left || this.updateMapParams.right !== right) {
			this.updateMapParams = {
				zoom: zoom,
				top: top,
				bot: bot,
				left: left,
				right: right
			};
			if(!this.state.isLoading) {
				this.updateMapData();
			} else if(!this.updateQueued){ //if already loading, queue update function to wait before updating again
				setTimeout(this.updateMapData, 500); //prevents multiple simultaneous requests to backend data service
				this.updateQueued = true;
			}
		}
	};

	//check if data is present for all of current view window; if not, request new data from cloud service
	updateMapData = () => {
		if(this.state.isLoading) { //if already loading, keep waiting before updating again
			setTimeout(this.updateMapData, 500)
		} else if(this.updateMapParams.zoom >= 4) { //update map if zoom is great enough to limit number of tiles
			this.updateQueued = false;
			this.setState({ isLoading: true });

			let startTime = 0;
			let now = new Date().valueOf();
			//calculate startTime
			switch (this.timeSpan) {
				case "pastDay":
					startTime = now - millisecTimes.day;
					break;
				case "pastWeek":
					startTime = now - millisecTimes.week;
					break;
				case "pastMonth":
					startTime =  now - millisecTimes.month;
					break;
				case "pastYear":
					startTime = now - millisecTimes.year;
					break;
				case "allTime":
					break;
				default:
					console.error("In data for valid time span is being requested! Map failed to update!");
					this.setState({ isLoading: false });
					return;
			}

			if(this.state.cacheData) {
				//tiles that are currently within map window view
				let tiles = Utility.listOfTiles(this.updateMapParams.top, this.updateMapParams.bot, this.updateMapParams.left,
					this.updateMapParams.right);
				//check if data is already on map or in cache
				let cacheResult = Utility.checkCache(this.cache[this.timeSpan], tiles);
				//fetch data if not in cache
				if(cacheResult.tilesNeeded.length > 0) {
					this.tileIdOfLoading = cacheResult.tilesNeeded; //Ids of tiles for which data will need to be added to cache later
					Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
						this.updateMapParams.bot, startTime, this.newDataHandler, this.timeSpan);
				} else {
					this.setState({ isLoading: false })
				}
				//add features to map that were in cache
				if(cacheResult.features.length > 0) {
					this.newDataHandler(null, {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: cacheResult.features
						}
					}, this.timeSpan, false);
				}
			} else { //data not cached, always request from data service
				Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
					this.updateMapParams.bot, startTime, this.newDataHandler, this.timeSpan);
			}
		} else {
			this.updateQueued = false;
			//TODO: alert user that they need to zoom in further before more data will be placed on map
		}
	};

	//update tiles in cache with data (features) returned from server, and return all features to be displayed
	//TODO: look for ways to combine loops
	updateCache = (timespan, features) => {
		let tiles = {};
		let tileIds = [];
		//for each feature determine what tile it belongs to
		let prevTileId = "0";
		for(let i = 0; i < features.length; i++) {
			let feature = features[i];
			let tileId = Utility.redCoordDim(feature.geometry.coordinates[0], feature.geometry.coordinates[1]).toString();
			if(prevTileId !== tileId || i === 0) { //feature is for new tile
				//new cache tile
				tiles[tileId] = {
					onMap: true,
					features: [feature]
				};
				tileIds.push(tileId);
				prevTileId = tileId;
			} else {
				tiles[tileId].features.push(feature); //add feature to tile in list
			}
		}
		let cache = this.cache[timespan];
		//for each tile if it's not in cache or present on map, add to cache
		for(let i = 0; i < tileIds.length; i++) {
			let tileId = tileIds[i];
			let tile = tiles[tileId];
			let cacheTile = cache[tileId]; //check for tile in cache
			if(!cacheTile) {
				cache[tileId] = tile; //add tile to cache
				cache.tileIds.push(tileId);
			} else if(!cacheTile.onMap || cacheTile.features.length !== tile.features.length) {
				cache[tileId] = tile; //update tile in cache
			}
		}
		//loop through loading tiles Ids and add empty tiles to cache
		for(let i = 0; i < this.tileIdOfLoading.length; i++) {
			let tileId = this.tileIdOfLoading[i];
			if(cache[tileId] === undefined) {
				cache[tileId] = {
					onMap: true,
					features: []
				};
				cache.tileIds.push(tileId);
			}
		}
		this.tileIdOfLoading = [];
		console.log("Cache for " + timespan + " updated:", cache);

		//up to-date features to display
		let displayFeatures = [];
		for(let i = 0; i < cache.tileIds.length; i++) {
			displayFeatures.push.apply(displayFeatures, cache[cache.tileIds[i]].features); //add features to map
		}
		return displayFeatures;
	};

	newDataHandler = (msg, geoJson, timespan, replace = true) => {
		if(geoJson === null) {
			alert(msg);
			this.setState({ displayAll: false, isLoading: false });
		} else if(geoJson.data && geoJson.data.type === "FeatureCollection") {
			let features = !this.state.cacheData ? geoJson.data.features : (replace //if replace update cache, otherwise place old + new
				? this.updateCache(timespan, geoJson.data.features)
				: this.state.trailPointData.data.features.concat(geoJson.data.features));
			this.setState({
				trailPointData: {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: features
						}
				},
				dataVersion: this.state.dataVersion + 1,
				displayAll: features.length > 0,
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
		                          cacheData={this.state.cacheData} cacheDataHandler={this.cacheDataHandler}
		                          timeHandler={this.timeChangeHandler} timeOptions={timeOptions}
                                  refreshHandler={this.refreshHandler}
		            />
		            <MapDisplay dataType="trailRoughness" trailPointData={this.state.trailPointData}
		                        dataVisible={this.state.displayAll} topoMap={this.state.topoMap}
		                        updateHandler={this.updateMapHandler} dataVersion={this.state.dataVersion}
		            />
	            </div>
				<LoadIcon isLoading={this.state.isLoading}/>
            </div>
		);
	}
}

export default App;
