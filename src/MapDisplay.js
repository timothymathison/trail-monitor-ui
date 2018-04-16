import React, {Component} from 'react';
import ReactMapboxGl, { Layer, RotationControl, ZoomControl, Source, ScaleControl } from "react-mapbox-gl";

const Map = ReactMapboxGl({
	accessToken: process.env.REACT_APP_MAPBOX_API_KEY
});

const distanceUnits = "mi"; //distance units used for scale ruler
const roughColorPalette = ["#2dc937", "#99c140", "#e7b416", "#db7b2b", "#cc3232"]; //range of colors for roughness data visualization
const traffColorPalette = ["#BEE0CC", "#70C3D0", "#419DC5", "#316BA7", "#223B89"];

const mapStyleDark = "mapbox://styles/mapbox/dark-v9";
const mapStyleTopo = "mapbox://styles/mapbox/outdoors-v10";

class MapDisplay extends Component {
	defaultZoom = [9];
	transitionZoom = 10; //zoom at which heatmap transitions to points
	valueMax = 10; //max trail point roughness value, data with roughness value greater than this will not appear differently
	trafficMaxFactor = 10; //tunable: used for calculating what level of traffic will be considered maximum intensity
	map; //keep a copy of a pointer to map around in case it's needed, mostly to get info about the map object
	hasRendered = false;
	zoom = this.defaultZoom[0];

	constructor(props) {
		super(props);
		let mapData = this.processData(props.trailInfoTiles);
		this.state = {
			center: {lng: -92.958210, lat: 45.363131}, //default
			pointData: mapData.pointData,
			lineData: mapData.lineData,
			dataVersion: props.dataVersion,
			dataType: props.dataType,
			dataVisible: props.dataVisible,
			pointsVisible: props.pointsVisible,
			roughnessVisible: props.roughnessVisible,
			topoMap: props.topoMap,
			trafficMax: 0
		};
	}

	componentWillReceiveProps(newProps) {
		let mapData = this.state.dataVersion !== newProps.dataVersion ?
            this.processData(newProps.trailInfoTiles, newProps.zoomRanges) :
			{
				pointData: this.state.pointData,
				lineData: this.state.lineData,
				trafficMax: this.state.trafficMax
			};
		this.setState({
			pointData: mapData.pointData,
			lineData: mapData.lineData,
			dataVersion: newProps.dataVersion,
			dataType: newProps.dataType,
			dataVisible: newProps.dataVisible,
			pointsVisible: newProps.pointsVisible,
			roughnessVisible: newProps.roughnessVisible,
			topoMap: newProps.topoMap,
			trafficMax: mapData.trafficMax
		});
	}

	shouldComponentUpdate(newProps, newState) {
		return newState.dataVisible !== this.state.dataVisible || newState.dataVersion !== this.state.dataVersion
			|| newState.topoMap !== this.state.topoMap || newState.pointsVisible !== this.state.pointsVisible
			|| newState.roughnessVisible !== this.state.roughnessVisible
			|| newState.center.lng !== this.state.center.lng || newState.center.lat !== this.state.center.lat;
	}

	//handle and react to map events
	handleMapEvents = (map, event) => {
		if(event.type === "dragend" || event.type === "zoomend") {
			console.log("handling map event");
			let zoom = map.getZoom();
			let center = map.getCenter();

			let top = map.getBounds()._ne.lat;
			let bottom = map.getBounds()._sw.lat;
			let left = map.getBounds()._sw.lng;
			let right = map.getBounds()._ne.lng;

			this.zoom = zoom;
			this.setState({ center: center }); //update center so later re-renders don't re-position map
			this.props.updateHandler(Math.floor(top), Math.floor(bottom), Math.floor(left), Math.floor(right), zoom, !this.hasRendered); //check if map data needs to be updated
			this.hasRendered = true;

			// console.log("Edges: ", top, bottom, left, right);
			// console.log("# of tiles: " + Utility.listOfTiles(top, bottom, left, right).length);
			console.log("zoom: " + map.getZoom());
		} else if(event.type === "render" && !this.hasRendered) { // first ever render triggers data request
			let top = map.getBounds()._ne.lat;
			let bottom = map.getBounds()._sw.lat;
			let left = map.getBounds()._sw.lng;
			let right = map.getBounds()._ne.lng;

			navigator.geolocation.getCurrentPosition((pos) => { //center map at location
				//triggers a scroll event causing this handler to immediately be invoked again
				this.setState({ center: {lng: pos.coords.longitude, lat: pos.coords.latitude} });
			}, () => { //unable to get current location, go ahead and load data
				this.hasRendered = true;
                this.props.updateHandler(top, bottom, left, right, map.getZoom(), true);
			})
		}
		if(this.map !== map) {
			this.map = map; //update copy of pointer to map
		}
	};

	//combine features from each tile to two geojson objects (points, and lines)
	processData = (tiles, zoomRanges) => {
		let pointFeatures = []; //used for circle and heatmap layers
		let lineFeatures = []; //used for line layer
		let mostTraffic = 0; //keeps track of the greatest amount of traffic found out of all tiles
		let trafficCoeff = 0;
		for(let i = 0; i < tiles.length; i++) {
			let tile = tiles[i];
			if(tile.type === "FeatureCollection") {
				pointFeatures.push.apply(pointFeatures, tile.pointData); //add tile point feature list to point data
				if(tile.lineData) {
					lineFeatures.push.apply(lineFeatures, tile.lineData) //add tile line feature list to line data
				}
			} else if (tile.type === "Feature") {
				pointFeatures.push(tile.features);
			}
			if(tile.totalTraffic !== undefined && tile.totalTraffic > mostTraffic) {
				mostTraffic = tile.totalTraffic;
			}
			// console.log(mostTraffic);
		}

		//calculate traffic max display value
		if(tiles.length > 0 && zoomRanges && zoomRanges.length > 0) {
			//zoom depth effects average number of raw points that will be mapped to a single feature
			let zoomDepth = zoomRanges.indexOf(tiles[0].zoomRange);
			if(zoomDepth < 0) {
				console.error("Tile processed which does not belong to a valid zoomRange");
			} else {
				//tune trafficMaxFactor to control how sensitive map is to traffic levels and total number of raw points
				trafficCoeff = (this.trafficMaxFactor ** zoomDepth) / (100 ** zoomDepth);
				//TODO: may need to also have linear factor for calculating traffic max value
			}
		}
		return {
			pointData: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: pointFeatures
                }
			},
			lineData: {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: lineFeatures
				}
			},
			trafficMax: mostTraffic * trafficCoeff
		};
	};

	plotLines = (dataColorPalette, colorStops) => {
		return (
			<React.Fragment>
				<Source id="lineData" type="feature" geoJsonSource={this.state.lineData}/>
				<Layer id="lineLayer" sourceId="lineData" type="line"
                       layout={{
                           "visibility": this.state.dataVisible && !this.state.pointsVisible ? "visible" : "none",
                       }}
				       paint={{
                           "line-width": {
                               'base': 2,
                               'stops': [[10, 2], [20, 40]]
                           },
                           "line-color": [
                               "interpolate",
                               ["linear"],
                               ["get", this.state.roughnessVisible ? "value" : "traffic"],
                               colorStops[0], dataColorPalette[0],
                               colorStops[1], dataColorPalette[1],
                               colorStops[2], dataColorPalette[2],
                               colorStops[3], dataColorPalette[3],
                               colorStops[4], dataColorPalette[4]
                           ],
                           "line-opacity": [
                               "interpolate",
                               ["linear"],
                               ["zoom"],
                               this.transitionZoom - 1, 0,
                               this.transitionZoom + 1, 1
                           ]
				       }}
				>
				</Layer>
			</React.Fragment>
		);
	};

	//plots data as colored dots
	plotPoints = (dataColorPalette, colorStops) => {
		return (
			<React.Fragment>
				<Source id="pointData" type="feature" geoJsonSource={this.state.pointData}/>
				<Layer id="pointLayer" sourceId="pointData" type="circle" minzoom={this.transitionZoom - 1}
			        layout={{
				       "visibility": this.state.dataVisible && this.state.pointsVisible ? "visible" : "none",
			        }}
			        paint={{
						"circle-radius": {
							'base': 1.75,
							'stops': [[10, 1], [20, 20]] //how big points/dots appear at different zooms, will change linearly between zoom stops
						},
						"circle-color": [
							"interpolate",
							["linear"],
							["get", this.state.roughnessVisible ? "value" : "traffic"],
							colorStops[0], dataColorPalette[0],
							colorStops[1], dataColorPalette[1],
							colorStops[2], dataColorPalette[2],
							colorStops[3], dataColorPalette[3],
							colorStops[4], dataColorPalette[4]
						],
						"circle-opacity": [
							"interpolate",
							["linear"],
							["zoom"],
							this.transitionZoom - 1, 0,
							this.transitionZoom + 1, 1
						]
					}}
				>
				</Layer>
			</React.Fragment>
		);
	};

	//plots data as a generic heatmap (NOT lines)
	plotHeatMap = (dataColorPalette, weightStops) => {
		return (
			<React.Fragment>
				<Source id="heatData" geoJsonSource={this.state.pointData}/>
				<Layer id="heatmapLayer" sourceId="heatData" type="heatmap" maxzoom={this.transitionZoom + 1}
			        layout={{
				        "visibility": this.state.dataVisible ? "visible" : "none",
			        }}
			        paint={{
						// Increase the heatmap weight based on frequency and property magnitude
						"heatmap-weight": [
							"interpolate",
							["linear"],
							["get", this.state.roughnessVisible ? "value" : "traffic"],
							weightStops[0], 0.1,
							weightStops[4], 1
						],
						// Increase the heatmap color weight weight by zoom level
						// heatmap-intensity is a multiplier on top of heatmap-weight
						"heatmap-intensity": [
							"interpolate",
							["linear"],
							["zoom"],
							0, 1,
							this.transitionZoom, 3
						],
						// Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
						// Begin color ramp at 0-stop with a 0-transparancy color
						// to create a blur-like effect.
						"heatmap-color": [
							"interpolate",
							["linear"],
							["heatmap-density"],
							0, dataColorPalette[0],
							0.25, dataColorPalette[1],
							0.5, dataColorPalette[2],
							0.75, dataColorPalette[3],
							1, dataColorPalette[4]
						],
						// Adjust the heatmap radius by zoom level
						"heatmap-radius": [
							"interpolate",
							["linear"],
							["zoom"],
							0, 1,
							this.transitionZoom, 2.5
						],
						// Transition from heatmap to circle layer by zoom level
						"heatmap-opacity": [
							"interpolate",
							["linear"],
							["zoom"],
							this.transitionZoom - 1, 1,
							this.transitionZoom + 1, 0
						]
					}}
				>
				</Layer>
			</React.Fragment>
		)
	};

	renderLegend = (dataColorPalette, colorStops) => {
		let startColor = this.state.roughnessVisible ? dataColorPalette[0] : dataColorPalette[1];
		let endColor = this.state.roughnessVisible ? dataColorPalette[4] : dataColorPalette[3];
		return (
			<div className="legend">
				<p style={{color: startColor}}>{colorStops[0]}</p>
				<div style={{backgroundColor: dataColorPalette[0]}}></div>
                <div style={{backgroundColor: dataColorPalette[1]}}></div>
                <div style={{backgroundColor: dataColorPalette[2]}}></div>
                <div style={{backgroundColor: dataColorPalette[3]}}></div>
                <div style={{backgroundColor: dataColorPalette[4]}}></div>
				<p style={{color: endColor}}>{Math.round(colorStops[4])}</p>
			</div>
		);
	};

	render() {
		//TODO: add full screen button
		//TODO: add search for location box
		//TODO: add tooltip when hovering over a point
		let dataColorPalette = this.state.roughnessVisible ? roughColorPalette : traffColorPalette;
		let max = this.state.roughnessVisible ? this.valueMax : this.state.trafficMax;
		let colorStops = [0, max * 0.25, max * 0.5, max * 0.75, max];
		return(
			<div id="map-container">
                {this.renderLegend(dataColorPalette, colorStops)}
				<Map
					style = {this.state.topoMap ? mapStyleTopo : mapStyleDark}
					containerStyle = {{ height: "100%", width: "100%" }}
					center = {this.state.center}
					zoom = {this.defaultZoom}
					onDragEnd = {this.handleMapEvents}
					onZoomEnd = {this.handleMapEvents}
					onRender = {this.handleMapEvents}>
                    <RotationControl style={{ marginTop: "20px" }}/>
					<ZoomControl/>
					<ScaleControl position="bottom-right" measurement={distanceUnits} style={{ bottom: "20px" }}/>
					{this.plotPoints(dataColorPalette, colorStops)}
					{this.plotHeatMap(dataColorPalette, colorStops)}
					{this.plotLines(dataColorPalette, colorStops)}
				</Map>
			</div>
		);
	}
}

export default MapDisplay;

