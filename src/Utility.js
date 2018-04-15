
//API URL specified in .env* file
const awsApiUrl = process.env.REACT_APP_AWS_API_URL;

class Utility {

	//request data from API - AWS cloud data service
	static requestData = (top, left, right, bottom, startTime, zoom, dataHandler, timespan, done) => {
		let url = awsApiUrl + "?lim-top=" + top + "&lim-left=" + left + "&lim-right=" + right + "&lim-bot=" + bottom +
			"&start-time=" + startTime + "&zoom=" + zoom;

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
	};

	//returns a corresponding zoom range from a single  zoom value
	//zoom range expected in format like: "2-6" where the first number is lower bound (inclusive) and second number is the upper bound (exclusive)
	static rangeFromZoom = (zoomRanges, zoom) => {
		try {
            for(let i = 0; i < zoomRanges.length; i++) {
                let between = zoomRanges[i].split("-");
                if(zoom >= parseInt(between[0], 10) && zoom < parseInt(between[1], 10)) {
                    return zoomRanges[i];
                }
            }
            return undefined;
		} catch (e) {
            return undefined;
        }
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

	//checks whether to arrays have same elements
	static arrayElemEqual = (a, b) => {
        if (a === b) return true;
        if ( a === undefined || a == null || b === undefined || b == null) return false;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };
}

export default Utility
