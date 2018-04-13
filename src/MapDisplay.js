import React, {Component} from 'react';
import ReactMapboxGl, { Layer, ZoomControl, Source, ScaleControl } from "react-mapbox-gl";
import Utility from './Utility.js';

const Map = ReactMapboxGl({
	accessToken: process.env.REACT_APP_MAPBOX_API_KEY
});

const distanceUnits = "mi"; //distance units used for scale ruler
const dataColorPalette = ["#2dc937", "#99c140", "#e7b416", "#db7b2b", "#cc3232"]; //range of colors for data visualization
//const dataColorPallette = ["rgba(33,102,172,0)", "rgb(103,169,207)", "rgb(209,229,240)", "rgb(253,219,199)", "rgb(239,138,98)", "rgb(178,24,43)"];


const mapStyleDark = "mapbox://styles/mapbox/dark-v9";
const mapStyleTopo = "mapbox://styles/mapbox/outdoors-v10";

class MapDisplay extends Component {
	defaultZoom = [9];
	transitionZoom = 10; //zoom at which heatmap transitions to points
	valueMax = 10; //max trail point roughness value
	map; //keep a copy of a pointer to map around in case it's needed, mostly to get info about the map object
	hasRendered = false;
	zoom = this.defaultZoom[0];
	// center = {lng: -92.958210, lat: 45.363131}; //default

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
			topoMap: props.topoMap
		};
	}

	componentWillReceiveProps(newProps) {
		let mapData = this.state.dataVersion !== newProps.dataVersion ?
            this.processData(newProps.trailInfoTiles) :
			{
				pointData: this.state.pointData,
				lineData: this.state.lineData
			};

		this.setState({
			pointData: mapData.pointData,
			lineData: mapData.lineData,
			dataVersion: newProps.dataVersion,
			dataType: newProps.dataType,
			dataVisible: newProps.dataVisible,
			pointsVisible: newProps.pointsVisible,
			topoMap: newProps.topoMap
		});
	}

	shouldComponentUpdate(newProps, newState) {
		return newState.dataVisible !== this.state.dataVisible || newState.topoMap !== this.state.topoMap
			|| newState.pointsVisible !== this.state.pointsVisible
			|| newState.dataVersion !== this.state.dataVersion || newState.center.lng !== this.state.center.lng ||
			newState.center.lat !== this.state.center.lat;
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
			// this.center = center;
			this.setState({ center: center }); //update center so later re-renders don't re-position map
			this.props.updateHandler(Math.floor(top), Math.floor(bottom), Math.floor(left), Math.floor(right), zoom); //check if map data needs to be updated

			console.log("Edges: ", top, bottom, left, right);
			console.log("# of tiles: " + Utility.listOfTiles(top, bottom, left, right).length);
			console.log("zoom: " + map.getZoom());
		} else if(event.type === "render" && !this.hasRendered) { // first ever render triggers data request
			let top = map.getBounds()._ne.lat;
			let bottom = map.getBounds()._sw.lat;
			let left = map.getBounds()._sw.lng;
			let right = map.getBounds()._ne.lng;
			this.hasRendered = true;

			navigator.geolocation.getCurrentPosition((pos) => { //center map at location
				this.setState({ center: {lng: pos.coords.longitude, lat: pos.coords.latitude} });
			}, () => { //unable to get current location, go ahead and load data
                this.props.updateHandler(top, bottom, left, right, map.getZoom());
			})
		}
		if(this.map !== map) {
			this.map = map; //update copy of pointer to map
		}
	};

	//combine features from each tile to two geojson objects (points, and lines)
	processData = (tiles) => {
		let pointFeatures = [];
		let lineFeatures = [];
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
			}
		};
	};

	plotLines = () => {
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
                               'stops': [[12, 2], [20, 40]]
                           },
                           "line-color": [
                               "interpolate",
                               ["linear"],
                               ["get", "value"],
                               0, dataColorPalette[0],
                               2.5, dataColorPalette[1],
                               5, dataColorPalette[2],
                               7.5, dataColorPalette[3],
                               10, dataColorPalette[4]
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
	plotPoints = () => {
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
							'stops': [[12, 2], [20, 50]]
						},
						"circle-color": [
							"interpolate",
							["linear"],
							["get", "value"],
							0, dataColorPalette[0],
							2.5, dataColorPalette[1],
							5, dataColorPalette[2],
							7.5, dataColorPalette[3],
							10, dataColorPalette[4]
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
	plotHeatMap = () => {
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
							["get", "value"],
							0, 0,
							this.valueMax, 1
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
							0.2, dataColorPalette[1],
							0.4, dataColorPalette[2],
							0.6, dataColorPalette[3],
							0.8, dataColorPalette[4]
						],
						// Adjust the heatmap radius by zoom level
						"heatmap-radius": [
							"interpolate",
							["linear"],
							["zoom"],
							0, 1,
							this.transitionZoom, 5
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

	render() {
		//TODO: render compass
		//TODO: add search for location box
		return(
			<div id="map-container">
				<Map
					style = {this.state.topoMap ? mapStyleTopo : mapStyleDark}
					containerStyle = {{ height: "100%", width: "100%" }}
					center = {this.state.center}
					zoom = {this.defaultZoom}
					onDragEnd = {this.handleMapEvents}
					onZoomEnd = {this.handleMapEvents}
					onRender = {this.handleMapEvents}>
					<ZoomControl/>
					<ScaleControl position="bottom-right" measurement={distanceUnits} style={{ bottom: "20px" }}/>
					{this.plotPoints()}
					{this.plotHeatMap()}
					{this.plotLines()}
				</Map>
			</div>
		);
	}
}

export default MapDisplay;

