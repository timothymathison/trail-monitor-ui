
const awsApiUrl = "";

class Utility {

	//TODO: Request data from API
	static requestData = (top, left, right, bottom, startime) => {
		let url = awsApiUrl + "lim-top=" + top + "&lim-left=" + left + "&lim-right=" + right + "&lim-bot=" + bottom + "&startime=" + startime;
		let apiRequest = new XMLHttpRequest();

		apiRequest.open("GET", url, true);
		apiRequest.onreadystatechange = function () {
			if(apiRequest.readyState === 4 && apiRequest.status === 200) {
				try {
					console.log(JSON.parse(apiRequest.responseText));
				} catch (e) {
					console.error("Could not parse response text")
				}

			} else if(apiRequest.readyState === 4 && apiRequest.status === 400){
				try {
					console.error("Server responded with bad request - message: " + JSON.parse(apiRequest.responseText).message);
				} catch (e) {
					console.error("Server responded with bad request");
					console.error("Could not parse response text")
				}
			} else {
				console.error("Server Error when requesting new data");
			}
		};

		apiRequest.send();
	};

	//Reduce-Coordinate-Dimension - Generates a unique linear value (tile identifier/coordinate) for each integer latitude/longitude combination
	static redCoordDim = (lng, lat) => {
		return Math.floor(lng) * 200 + Math.floor(lat);
	};

	static listOfTiles = (top, bot, left, right) => {
		let height = top - bot + 1;
		let width = right - left + 1;
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
