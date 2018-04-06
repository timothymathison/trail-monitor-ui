
//API URL specified in .env* file
const awsApiUrl = process.env.REACT_APP_AWS_API_URL;

class Utility {

	//request data from API - AWS cloud data service
	static requestData = (top, left, right, bottom, startTime, dataHandler, timespan, done) => {
		let url = awsApiUrl + "?lim-top=" + top + "&lim-left=" + left + "&lim-right=" + right + "&lim-bot=" + bottom + "&start-time=" + startTime;

		let apiRequest = new XMLHttpRequest();
		apiRequest.onreadystatechange = function () {
			if(apiRequest.readyState === 4) {
				if(apiRequest.status === 200) {
					let data = null;
					try {
						data = JSON.parse(apiRequest.responseText);
						console.log("Fetched data: ", data);
					} catch (e) {
						console.error("Could not parse response text");
					}
					if(data === null) {
                        dataHandler("Error fetching new data", data, timespan, done);
					} else {
                        dataHandler("Data loaded", data, timespan, done)
					}
				} else if(apiRequest.status === 400){
					try {
						let message = JSON.parse(apiRequest.responseText).message;
						console.error("Server responded with bad request - message: " + message);
					} catch (e) {
						console.error("Server responded with bad request");
						console.error("Could not parse response text");
					}
                    dataHandler("Error fetching new data", null, timespan, done);
				} else {
					console.error("Server Error when requesting new data");
                    dataHandler("Error fetching new data", null, timespan, done);
				}
			}
		};
		apiRequest.open("GET", url, true);
		apiRequest.send();

		//for testing without making server requests:
		// setTimeout(function () {
		// 	dataCallback("Data Fetched", Utility.buildPointData(), timespan)
		// }, 1000);
	};

	//checks cache for all data corresponding to lookForTiles
	static checkCache = (cache, lookForTiles) => {
		let tilesNeeded = [];
		let features = [];
		//check if tiles are in cache and if they are already displayed on map
		for(let i = 0; i < lookForTiles.length; i++) {
			let tileId = lookForTiles[i];
			let tile = cache[tileId];
			if(tile === undefined) { //not found, need to request from backend data service
				tilesNeeded.push(tileId);
			} else if(!tile.onMap) { //found, but is not displayed on map
				features.push.apply(features, tile.features); //features to be added to map
				tile.onMap = true; //TODO: this should probably be done in App
			}
		}

		return {
			tilesNeeded: tilesNeeded,
			features: features
		};
	};

	//Reduce-Coordinate-Dimension - Generates a unique linear value (tile identifier/coordinate) for each integer latitude/longitude combination
	static redCoordDim = (lng, lat) => {
		return Math.floor(lng) * 200 + Math.floor(lat);
	};

	static listOfTiles = (top, bot, left, right) => {
		let tileCoords = [];

		for(let lat = Math.floor(top); lat >= Math.floor(bot); lat--) {
			for(let lng = Math.floor(left); lng <= Math.floor(right); lng++) {
				tileCoords.push(Utility.redCoordDim(lng, lat).toString()); //add single dimension tile coordinates to list
			}
		}

		return tileCoords;
	};

	//builds hard coded data
	static buildPointData = () => {
		return {
			"type": "geojson",
			"data": {
				"type": "FeatureCollection",
				"features": [
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.363131]
						},
						"properties": {
							"value": 1
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.363531]
						},
						"properties": {
							"value": 2
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.364131]
						},
						"properties": {
							"value": 3
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.364531]
						},
						"properties": {
							"value": 4
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.365131]
						},
						"properties": {
							"value": 5
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.365531]
						},
						"properties": {
							"value": 6
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.366131]
						},
						"properties": {
							"value": 7
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958210, 45.366531]
						},
						"properties": {
							"value": 8
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.958510, 45.367131]
						},
						"properties": {
							"value": 9
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.959110, 45.367531]
						},
						"properties": {
							"value": 10
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.959510, 45.368131]
						},
						"properties": {
							"value": 10
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.960110, 45.368331]
						},
						"properties": {
							"value": 9
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.960510, 45.368031]
						},
						"properties": {
							"value": 8
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.961110, 45.367531]
						},
						"properties": {
							"value": 7
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.961510, 45.367031]
						},
						"properties": {
							"value": 6
						}
					},
					{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.961510, 45.366531]
						},
						"properties": {
							"value": 5
						}
					},{
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [-92.961510, 45.366031]
						},
						"properties": {
							"value": 3
						}
					},
				]
			}
		};
	};

	static buildLineData = () => {
		return {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: {
							type: "LineString",
							coordinates: [
								[-92.958210, 45.363131], [-92.958210, 45.364531]
							]
						},
						properties: {
							value: 3
						}
					},{
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [-92.960510, 45.368031], [-92.961510, 45.366031]
                            ]
                        },
                        properties: {
                            value: 8
                        }
                    }
				]
			}
		};
	};
}

export default Utility
