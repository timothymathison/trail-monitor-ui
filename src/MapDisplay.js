import React, {Component} from 'react';
import ReactMapboxGl, { Layer, ZoomControl, Source, ScaleControl } from "react-mapbox-gl";
import Utility from './Utility.js';

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoidGltb3RoeW1hdGhpc29uIiwiYSI6ImNqZGc3OWp3NzBoMXcycG5xMHBwbG90cHAifQ.9GqvGqNIxpezA5ofbe0Wbg"
});

const distanceUnits = "mi"; //distance units used for scale ruler
const dataColorPalette = ["#2dc937", "#99c140", "#e7b416", "#db7b2b", "#cc3232"]; //range of colors for data visualization
//const dataColorPallette = ["rgba(33,102,172,0)", "rgb(103,169,207)", "rgb(209,229,240)", "rgb(253,219,199)", "rgb(239,138,98)", "rgb(178,24,43)"];


const mapStyleDark = "mapbox://styles/mapbox/dark-v9";
const mapStyleTopo = "mapbox://styles/mapbox/outdoors-v10";

class MapDisplay extends Component {
	minZoom = 3;
	defaultZoom = [9];
	transitionZoom = 13; //zoom at which heatmap transitions to points
	valueMax = 10; //max trail point roughness value
	map; //keep a copy of a pointer to map around in case it's needed, mostly to get info about the map object

	constructor(props) {
		super(props);
		this.state = {
			center: [-92.958210, 45.363131], //default
			geoJsonData: props.trailPointData,
			dataType: props.dataType,
			dataVisible: props.dataVisible,
			topoMap: props.topoMap
		};
		this.map = null; //null to start until its loaded
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			geoJsonData: newProps.trailPointData,
			dataType: newProps.dataType,
			dataVisible: newProps.dataVisible,
			topoMap: newProps.topoMap
		});
	}

	shouldComponentUpdate(newProps) {
		return newProps.dataVisible !== this.state.dataVisible || newProps.topoMap !== this.state.topoMap;
	}

	//handle and react to map events
	handleMapEvents = (map, event) => {
		if(event.type === "dragend" || event.type === "zoomend") {
			console.log("handling map event");
			let top = map.getBounds()._ne.lat;
			let bottom = map.getBounds()._sw.lat;
			let left = map.getBounds()._sw.lng;
			let right = map.getBounds()._ne.lng;
			let center = [(left + right) / 2, (top + bottom) / 2];

			this.setState({ center: center }); //update center so later re-renders don't re-position map
			// this.props.updateHandler(top, bottom, left, right, map.getZoom()); //check if map data needs to be updated

			console.log("# of tiles: " + Utility.listOfTiles(top, bottom, left, right).length);
			console.log("zoom: " + map.getZoom());
		} else if(event.type === "render" && this.map === null) { // first ever render triggers data request
			let top = map.getBounds()._ne.lat;
			let bottom = map.getBounds()._sw.lat;
			let left = map.getBounds()._sw.lng;
			let right = map.getBounds()._ne.lng;
			console.log("handling map event");
			this.props.updateHandler(top, bottom, left, right, map.getZoom());
		}
		if(this.map !== map) {
			this.map = map; //update copy of pointer to map
		}

	};

	//plots data as colored dots
	plotPoints = () => {
		console.log("Map rendered");
		return (
			<React.Fragment>
				<Source id="pointData" type="feature" geoJsonSource={this.state.geoJsonData}/>
				<Layer id="pointLayer" sourceId="pointData" type="circle" minzoom={this.transitionZoom - 1}
			        layout={{
				       "visibility": this.state.dataVisible ? "visible" : "none",
			        }}
			        paint={{
						'circle-radius': {
							'base': 1.75,
							'stops': [[12, 2], [20, 50]]
						},
						"circle-color": [
							"interpolate",
							["linear"],
							["get", "value"],
							1, dataColorPalette[0],
							3, dataColorPalette[1],
							5, dataColorPalette[2],
							7, dataColorPalette[3],
							9, dataColorPalette[4]
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
				<Source id="heatData" geoJsonSource={this.state.geoJsonData}/>
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
							this.transitionZoom, 8
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
					<ScaleControl position="top-right" measurement={distanceUnits} style={{ right: "48px" }}/>
					{this.plotPoints()}
					{this.plotHeatMap()}
				</Map>
			</div>
		);
	}
}

export default MapDisplay;

