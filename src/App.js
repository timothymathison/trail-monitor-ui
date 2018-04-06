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

const emptyTrailData = {
	featureCount: 0,
	tiles: []
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
const emptyCache = () => {
	return {
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
};

const alerts = {
    success: "success",
    warn: "warning",
    error: "error"
};

class App extends Component {
	updateQueued = false; //used for time sensitive logic
	isLoading = false; //used for time sensitive logic
	updateMapParams = {}; //holds most recent position and zoom of map window
	tileIdOfLoading = []; //tile id's that are still being fetched from server
	timeSpan = defaultTimeSpan; //currently selected view timespan
	cache = emptyCache(); //holds data for each tile (to reduce number of server requests)

	constructor(props) {
		super(props);
		this.state = {
			displayAll: false,
			topoMap: false,
            //used for rendering, should be set when isLoading above is set
			isLoading: false, //but may not always be the same due to asynchronous nature of "setState()"
			cacheData: true,
			trailInfoData: emptyTrailData,
			dataVersion: 0,
            alert: {
			    id: 0,
			    type: "success",
                message: "",
                timeout: null
            }
		};
	}

    //toggles the style of map - topographic or dark
    mapTypeHandler = (newValue) => {
        this.setState({ topoMap: newValue });
    };

	//turns all data display on/off
	//TODO: if map was scrolled while off, load data for current area
	displayAllHandler = (newValue) => {
		if(this.state.trailInfoData.featureCount > 0) {
			this.setState({ displayAll: newValue });
		} else {
			this.setState({ displayAll: false });
			this.alert(alerts.warn, "There is currently no data to display\nPlease change the map or view area", 5000);
		}
	};

	//toggles whether data is cached
	cacheDataHandler = (newValue) => {
		if(newValue) { //if data should be cached, add current map data to cache
			this.processDataUpdate(this.timeSpan, this.state.trailInfoData.tiles)
		} else {
			this.cache = emptyCache(); //empty the cache
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
		this.setState({ trailInfoData: emptyTrailData }, this.updateMapData); //set empty map data and update for new time
	};

	//when refresh button is clicked, empty cache and request new data
	refreshHandler = () => {
		console.log("Refresh data clicked");
		if(!this.loading()) {
            this.cache = emptyCache();
            this.setState({ trailInfoData: emptyTrailData });
            this.updateMapData((success) => {
                if(success) {
                    this.alert(alerts.success, "Displaying latest data", 3000);
                }
            });
		}
	};

	//ONLY set loading through this function
	setLoading = (value) => {
		this.setState({ isLoading: value });
		this.isLoading = value;
	};

	//use this function to return current loading status of map data
	loading = () => {
		// let isLoading = this.isLoading;
		// let isInTransition = this.isLoading !== this.state.isLoading;
		return this.isLoading;
	};

	//display inline alert
    alert = (type, msg, timeout) => {
        this.setState({
            alert: {
                id: this.state.alert.id + 1,
                type: type,
                message: msg,
                timeout: timeout
            }
        });
    };

	//set params for the data that needs to be displayed on map
	//TODO: don't load data if displayAll is off
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
			if(!this.loading()) {
				this.updateMapData();
			} else if(!this.updateQueued){ //if already loading, queue update function to wait before updating again
				setTimeout(this.updateMapData, 500); //prevents multiple simultaneous requests to backend data service
				this.updateQueued = true;
			}
		}
	};

	//check if data is present for all of current view window; if not, request new data from cloud service
    //done -> a function to call when done
	updateMapData = (done) => {
		if(this.loading()) { //if already loading, keep waiting before updating again
			setTimeout(this.updateMapData, 500, done);
		} else if(this.updateMapParams.zoom >= 4) { //update map if zoom is great enough to limit number of tiles
			this.updateQueued = false;
			this.setLoading(true);

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
					this.setLoading(false);
					return;
			}

			if(this.state.cacheData) {
				//tiles that are currently within map window view
				let tileIds = Utility.listOfTiles(this.updateMapParams.top, this.updateMapParams.bot, this.updateMapParams.left,
					this.updateMapParams.right);
				//check if data is already on map or in cache
				let cacheResult = this.checkCache(tileIds);
				//fetch data if not in cache
                let needData = cacheResult.tileIdsNeeded.length > 0;
				if(needData) {
					// this.tileIdOfLoading = cacheResult.tilesNeeded; //Ids of tiles for which data will need to be added to cache later
					Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
						this.updateMapParams.bot, startTime, this.newDataHandler, this.timeSpan, done);
				} else {
					this.setLoading(false);
				}
				//add features to map that were in cache
				if(cacheResult.tiles.length > 0) {
					this.newDataHandler(null, {
						type: "geotrailinfo",
						data: {
                            tiles: cacheResult.tiles,
							featureCount: cacheResult.featureCount
                        }
					}, this.timeSpan, needData ? () => {} : done, false);
				}
			} else { //data not cached, always request from data service
				Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
					this.updateMapParams.bot, startTime, this.newDataHandler, this.timeSpan, done);
			}
		} else {
			this.updateQueued = false;
            //alert user that they need to zoom in before more data will be loaded
			this.alert(alerts.warn, "Zoom in to load more data", 3000);
		}
	};

    //checks cache for all data corresponding to lookForTiles
    checkCache = (lookForTiles) => {
    	let cache = this.cache[this.timeSpan];
        let tileIdsNeeded = [];
        let tiles = [];
        let featureCount = 0;
        //check if tiles are in cache and if they are already displayed on map
        for(let i = 0; i < lookForTiles.length; i++) {
            let tileId = lookForTiles[i];
            let tile = cache[tileId];
            if(tile === undefined) { //not found, need to request from backend data service
                tileIdsNeeded.push(tileId);
            } else if(!tile.onMap) { //found, but is not displayed on map
                tiles.push(tile); //tiles to be added to map
                tile.onMap = true;
                featureCount += (tile.pointData ? tile.pointData.length : 0) + (tile.lineData ? tile.lineData.length : 0);
            }
        }

        return {
            tileIdsNeeded: tileIdsNeeded,
            tiles: tiles,
            featureCount: featureCount
        };
    };

	//update tiles in cache with data (features) returned from server, and return all features to be displayed
	processDataUpdate = (timespan, tiles) => {
		let cache = this.cache[timespan];
		//for each tile if it's not in cache or present on map, add to cache
		for(let i = 0; i < tiles.length; i++) {
			let tile = tiles[i];
			let tileId = Utility.redCoordDim(tile.cornerCoordinate.lng, tile.cornerCoordinate.lat).toString();
			let cacheTile = cache[tileId]; //check for tile in cache
			if(!cacheTile) {
				cache.tileIds.push(tileId); //new tile, add to list of tile ids
			}
			cache[tileId] = tile; //add/update tile in cache
		}
		console.log("Cache for " + timespan + " updated:", cache);

		//up to-date features to display
		let displayTiles = [];
		let featureCount = 0;
		for(let i = 0; i < cache.tileIds.length; i++) {
			let tile = cache[cache.tileIds[i]];
			tile.onMap = true;
			displayTiles.push(tile); //add to list which will be displayed on map
			featureCount += (tile.pointData ? tile.pointData.length : 0) + (tile.lineData ? tile.lineData.length : 0);
		}
		return {
			tiles: displayTiles,
			featureCount: featureCount
        };
	};

	//handles and sends to map new data coming from cache or server
	newDataHandler = (msg, trailInfo, timespan, callDone, fromServer = true) => {
	    let call = callDone ? callDone : () => {}; //if function callDone is defined call it
		if(trailInfo === null) {
			this.alert(alerts.error, msg);
			call(false, msg);
			this.setLoading(false);
			this.setState({ displayAll: this.state.trailInfoData.featureCount > 0 });
		} else if(trailInfo.data && trailInfo.type === "geotrailinfo") {
			try {
                let displayTiles;
                if (!this.state.cacheData) {
                    displayTiles = {
                        tiles: trailInfo.data.tiles,
                        featureCount: trailInfo.data.featureCount
                    }
                } else if (fromServer) { //if from server update/process cache, otherwise place old + new
                    displayTiles = this.processDataUpdate(timespan, trailInfo.data.tiles);
                } else { //if from cache
                    displayTiles = {
                        tiles: this.state.trailInfoData.tiles.concat(trailInfo.data.tiles),
                        featureCount: this.state.trailInfoData.featureCount + trailInfo.data.featureCount
                    }
                }
                this.setState({
                    trailInfoData: displayTiles,
                    dataVersion: this.state.dataVersion + 1,
                    displayAll: displayTiles.featureCount > 0
                });
                call(true, msg);
            } catch (e) {
                this.setState({ displayAll: false });
                console.error("Error when trying to process new data:", e);
                this.alert(alerts.error, "Unable to display data");
                call(false, "Unable to display data");
            }
            this.setLoading(false);
		} else {
			this.setLoading(false);
			this.setState({ displayAll: false });
			console.error("Invalid data fetched by request");
			this.alert(alerts.error, "Unable to display data");
            call(false, "Unable to display data");
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
                                  refreshHandler={this.refreshHandler} alert={this.state.alert}
		            />
		            <MapDisplay dataType="trailRoughness" dataVersion={this.state.dataVersion}
                                trailInfoTiles={this.state.trailInfoData.tiles}
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
