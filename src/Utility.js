
class Utility {

	//TODO: Request data from API

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
