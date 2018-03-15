
const awsApiUrl = "https://s71x34ids1.execute-api.us-east-2.amazonaws.com/TrailMonitor_Beta/trail-data?";

class Utility {

	//request data from API - AWS cloud data service
	static requestData = (top, left, right, bottom, startime, dataCallback) => {
		let url = awsApiUrl + "lim-top=" + top + "&lim-left=" + left + "&lim-right=" + right + "&lim-bot=" + bottom + "&start-time=" + startime;

		let apiRequest = new XMLHttpRequest();
		console.log("in request data");
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
						dataCallback("Error fetching new data", data);
					} else {
						dataCallback("Data Fetched", data)
					}
				} else if(apiRequest.status === 400){
					try {
						let message = JSON.parse(apiRequest.responseText).message;
						console.error("Server responded with bad request - message: " + message);
					} catch (e) {
						console.error("Server responded with bad request");
						console.error("Could not parse response text");
					}
					dataCallback("Error fetching new data", null);
				} else {
					console.error("Server Error when requesting new data");
					dataCallback("Error fetching new data", null);
				}
			}
		};
		apiRequest.open("GET", url, true);

		apiRequest.send();
	};

	//Reduce-Coordinate-Dimension - Generates a unique linear value (tile identifier/coordinate) for each integer latitude/longitude combination
	static redCoordDim = (lng, lat) => {
		return Math.floor(lng) * 200 + Math.floor(lat);
	};

	static listOfTiles = (top, bot, left, right) => {
		let tileCoords = [];

		for(let lat = top; lat >= bot; lat--) {
			for(let lng = left; lng <= right; lng++) {
				tileCoords.push(this.redCoordDim(lng, lat)); //add single dimension tile coordinates to list
			}
		}

		return tileCoords;
	};

	//builds hard coded data
	static buildData = (rawData) => {
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
	}
}

export default Utility
