import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import Utility from './Utility.js';
import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js';
import LoadIcon from './LoadIcon'

//must be same as list of millisecTimes above
const timeOptions = [
    {value: "day", label: "Past 24 Hours"},
    {value: "week", label: "Past 7 Days"},
    {value: "month", label: "Past 30 Days"},
    {value: "year", label: "Past Year"},
    {value: "all", label: "All Time"}
];
const defaultTimeSpan = timeOptions[4].value;

const millisecTimes = {
	day: 86400000, //24 hours
	week: 604800000, //7 days
	month: 2592000000, //30 days
	year: 31536000000, //365 days
	all: new Date().valueOf() // all time until now
};

const createEmptyCache = (zoomRanges) => {
    let cache = {};
    for( let t = 0; t < timeOptions.length; t++) {
        let timeOption = timeOptions[t].value;
        cache[timeOption] = {}; //create cache object for each time-span option
        if(zoomRanges && zoomRanges.length > 0) {
            for(let i = 0; i < zoomRanges.length; i++) {
                cache[timeOption][zoomRanges[i]] = { tileIds: [] }; //create cache object for each zoomRange
            }
        } else {
            cache[timeOption].tileIds = [];
        }
    }
    return cache;
};

const emptyTrailData = {
    featureCount: 0,
    tiles: []
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
	timeSpan = defaultTimeSpan; //currently selected view timespan
	zoomRange = "6-10"; //default starting zoom is 9, zoom range will be replaced with value from lambda response
	allZoomRanges = [];
	cache = createEmptyCache(this.allZoomRanges); //holds data for each tile (to reduce number of server requests)

	constructor(props) {
		super(props);
		this.state = {
			displayAll: false,
			displayPoints: true, //lines displayed when this is set to false (lines are a beta feature)
			displayRoughness: true,
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
	displayAllHandler = (newValue) => {
        this.setState({ displayAll: newValue });
        if(newValue) {
            this.updateMapData((success, msg, noData) => { //update map in case it was scrolled or zoomed while display was off
                if (success && noData) {
                    this.alert(alerts.warn, "There is currently no data to display\nPlease change the time span or view area", 5000);
                }
            });
        }
	};

	//selects between displaying circle points versus lines on map at higher zoom levels
	displayPointsHandler = (newValue) => {
		this.setState({ displayPoints: newValue });
		if(!this.state.displayAll) {
			this.alert(alerts.warn, "Show data is currently turned off", 5000);
		} else if(this.zoomRange !== this.allZoomRanges[this.allZoomRanges.length - 1]) {
			this.alert(alerts.warn, "Zoom in to see detailed data", 5000);
		}
	};

	//selects between displaying roughness values versus traffic levels on map
	displayRoughnessHandler = (newValue) => {
		this.setState({ displayRoughness: newValue });
		if(this.state.displayAll) {
            this.alert(alerts.success,
                newValue ? "Showing Roughness Conditions" : "Showing Traffic Conditions",
                5000);
        } else {
			this.alert(alerts.warn, "Show data is currently turned off", 5000);
		}
	};

	//toggles whether data is cached
	cacheDataHandler = (newValue) => {
		if(newValue) { //if data should be cached, add current map data to cache
			this.processDataUpdate(this.timeSpan, this.zoomRange, this.state.trailInfoData.tiles)
		} else {
			this.cache = createEmptyCache(this.allZoomRanges); //empty the cache
		}
		this.setState({ cacheData: newValue });
	};

	//changes the time-span for which data is displayed on map
	timeChangeHandler = (newTimeSpan) => {
		console.log("Time: ", newTimeSpan, "selected");
		if(this.state.cacheData) { //remove old timespan data from map and update status in cache
			let cache = this.cache[this.timeSpan][this.zoomRange];
			this.setOnMapFlagsFalse(cache);
		}
		this.timeSpan = newTimeSpan;
		this.setState({ trailInfoData: emptyTrailData }, this.updateMapData); //set empty map data and update for new time
	};

	//when refresh button is clicked, empty cache and request new data
	refreshHandler = () => {
		console.log("Refresh data clicked");
		if(!this.loading()) {
            this.cache = createEmptyCache(this.allZoomRanges);
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
	updateMapHandler = (top, bot, left, right, zoom, forceUpdate = false) => {
		if(this.updateMapParams.zoom !== zoom || this.updateMapParams.top !== top || this.updateMapParams.bot !== bot
			|| this.updateMapParams.left !== left || this.updateMapParams.right !== right) {
			this.updateMapParams = {
				zoom: zoom,
				top: top,
				bot: bot,
				left: left,
				right: right
			};
			if(this.state.displayAll || forceUpdate) { //if display data is toggled on, update map
                if (!this.loading()) {
                    this.updateMapData();
                } else if (!this.updateQueued) { //if already loading, queue update function to wait before updating again
                    setTimeout(this.updateMapData, 500); //prevents multiple simultaneous requests to backend data service
                    this.updateQueued = true;
                }
            }
		}
	};

	//check if data is present for all of current view window; if not, request new data from cloud service
    //done -> a function to call when done
	updateMapData = (done = () => {}) => {
		if(this.loading()) { //if already loading, keep waiting before updating again
			setTimeout(this.updateMapData, 500, done);
		} else if(this.updateMapParams.zoom >= 4) { //update map if zoom is great enough to limit number of tiles
			this.updateQueued = false;
			this.setLoading(true);

			let now = new Date().valueOf();
			//calculate startTime
			let toSubtract = millisecTimes[this.timeSpan];
			if(toSubtract === undefined) {
                console.error("In data for valid time span is being requested! Map failed to update!");
                this.setLoading(false);
                return;
			}
            let startTime = now - toSubtract;

			if(this.state.cacheData) {
				let newZoomRange = Utility.rangeFromZoom(this.allZoomRanges, this.updateMapParams.zoom);
				if(newZoomRange !== this.zoomRange) { //zoom range has changed
                    this.setOnMapFlagsFalse(this.cache[this.timeSpan][this.zoomRange]); //current data will be taken off map
                    this.zoomRange = newZoomRange;
                    this.setState({ trailInfoData: emptyTrailData }); //set empty data until new data is processed
                    console.log("Updating map, zoomRange:", this.zoomRange);
                }
				//tiles that are currently within map window view
				let tileIds = Utility.listOfTiles(this.updateMapParams.top, this.updateMapParams.bot, this.updateMapParams.left,
					this.updateMapParams.right);
				//check if data is already on map or in cache
				let cacheResult = this.checkCache(tileIds);
				//fetch data if not in cache
                let needData = cacheResult.tileIdsNeeded.length > 0;
				if(needData) {
					Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
						this.updateMapParams.bot, startTime, this.updateMapParams.zoom, this.newDataHandler, this.timeSpan, done);
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
				} else if(!needData) { //if there is no data to add to map and no data needed
					done(true, "Map is up to date", this.state.trailInfoData.featureCount === 0);
					this.setState({ displayAll: this.state.trailInfoData.featureCount > 0});
				}
			} else { //data not cached, always request from data service
				Utility.requestData(this.updateMapParams.top, this.updateMapParams.left, this.updateMapParams.right,
					this.updateMapParams.bot, startTime, this.updateMapParams.zoom, this.newDataHandler, this.timeSpan, done);
			}
		} else {
			this.updateQueued = false;
            //alert user that they need to zoom in before more data will be loaded
			this.alert(alerts.warn, "Zoom in to load more data", 3000);
		}
	};

	//set ".onMap" flags false for all tiles in cache
	setOnMapFlagsFalse = (cache) => {
        if(cache !== undefined) {
            for(let i = 0; i < cache.tileIds.length; i++) {
                cache[cache.tileIds[i]].onMap = false;
            }
        }
	};

    //checks cache for all data corresponding to lookForTiles
    checkCache = (lookForTiles) => {
    	let cache = this.cache[this.timeSpan][this.zoomRange];
    	if(cache === undefined) { //can't find cache
    		return {
    			tileIdsNeeded: lookForTiles, //need all tiles
			    tiles: [],
			    featureCount: 0
		    };
	    }

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
	processDataUpdate = (timeSpan, zoomRange, tiles) => {
		console.log("TimeSpan:", timeSpan);
		console.log("ZoomRange:", zoomRange);
		let cache = this.cache[timeSpan][zoomRange];
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
		console.log("Cache for time span: " + timeSpan + " and zoom range: " + zoomRange + " updated:", cache);

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
                	if(!Utility.arrayElemEqual(trailInfo.data.availableZoomRanges, this.allZoomRanges)) { //update zoom range option and re-build cache
						this.allZoomRanges = trailInfo.data.availableZoomRanges;
						this.cache = createEmptyCache(this.allZoomRanges);
						this.zoomRange = trailInfo.data.zoomRange;
	                }
                    displayTiles = this.processDataUpdate(timespan, trailInfo.data.zoomRange, trailInfo.data.tiles);
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
                call(true, msg, displayTiles.featureCount === 0);
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
		                          displayPoints={this.state.displayPoints} displayPointsHandler={this.displayPointsHandler}
		                          displayRoughness={this.state.displayRoughness} displayRoughnessHandler={this.displayRoughnessHandler}
		                          topoMap={this.state.topoMap} mapTypeHandler={this.mapTypeHandler}
		                          cacheData={this.state.cacheData} cacheDataHandler={this.cacheDataHandler}
		                          timeHandler={this.timeChangeHandler} timeOptions={timeOptions}
                                  refreshHandler={this.refreshHandler} alert={this.state.alert}
		            />
		            <MapDisplay dataType="trailRoughness" dataVersion={this.state.dataVersion}
                                trailInfoTiles={this.state.trailInfoData.tiles}
		                        dataVisible={this.state.displayAll} topoMap={this.state.topoMap}
		                        pointsVisible={this.state.displayPoints} roughnessVisible={this.state.displayRoughness}
		                        updateHandler={this.updateMapHandler} zoomRanges={this.allZoomRanges}
		            />
	            </div>
				<LoadIcon isLoading={this.state.isLoading}/>
            </div>
		);
	}
}

export default App;
