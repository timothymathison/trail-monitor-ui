import React, {Component, Fragment} from 'react';
import ReactMapboxGl, { Layer, ZoomControl, Source, ScaleControl } from "react-mapbox-gl";

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoidGltb3RoeW1hdGhpc29uIiwiYSI6ImNqZGc3OWp3NzBoMXcycG5xMHBwbG90cHAifQ.9GqvGqNIxpezA5ofbe0Wbg"
});

const distanceUnits = "mi";
const dataColorPalette = ["#2dc937", "#99c140", "#e7b416", "#db7b2b", "#cc3232"];
//const dataColorPallette = ["rgba(33,102,172,0)", "rgb(103,169,207)", "rgb(209,229,240)", "rgb(253,219,199)", "rgb(239,138,98)", "rgb(178,24,43)"];

class MapDisplay extends Component {
	defaultZoom = [9];
	transitionZoom = 12; //zoom at which heatmap transitions to points
	valueMax = 10;

	constructor(props) {
		super(props);
		this.state = {
			geoJsonData: props.data,
			dataType: props.dataType,
			dataVisible: props.dataVisible
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			geoJsonData: newProps.data,
			dataType: newProps.dataType,
			dataVisible: newProps.dataVisible
		});
	}

	// shouldComponentUpdate(newProps, newState) {
	// 	return true;
	// }

	// buildData = (rawData) => {
	// 	return {
	// 		"type": "geojson",
	// 		"data": {
	// 			"type": "Feature",
	// 			"geometry": {
	// 				"type": "MultiPoint",
	// 				"coordinates": [
	// 					[-92.958210, 45.363131],
	// 					[-92.958210, 45.364131],
	// 					[-92.958210, 45.365131],
	// 					[-92.958210, 45.366131]
	// 				]
	// 			},
	// 			"properties": {
	// 				// "title": "Mapbox DC",
	// 				// "marker-symbol": "monument"
	// 				"circle-color": "#ff0000"
	// 			}
	// 		}
	// 	};
	// };

	plotPoints = () => {
		return (
			<React.Fragment>
				<Source id="pointData" type="feature" geoJsonSource={this.state.geoJsonData}/>
				<Layer id="dotLayer" sourceId="pointData" type="circle" minzoom={this.transitionZoom - 1}
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

	plotHeatMap = () => {
		return (
			<React.Fragment>
				<Source id="heatData" geoJsonSource={this.state.geoJsonData}/>
				<Layer id="heatmap" sourceId="heatData" type="heatmap" maxzoom={this.transitionZoom + 1}
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
							0, 2,
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
					style = "mapbox://styles/mapbox/outdoors-v10"
					containerStyle = {{ height: "100%", width: "100%" }}
					center = {[-92.958210, 45.363131]}
					zoom = {this.defaultZoom}>
					<ZoomControl/>
					<ScaleControl position="top-right" measurement={distanceUnits} style={{ right: "48px" }}/>
					{this.plotPoints()}
					{this.plotHeatMap()}
					{/*<Layer*/}
						{/*type="symbol"*/}
						{/*id="marker"*/}
						{/*layout={{ "icon-image": "marker-15" }}>*/}
						{/*<Feature coordinates={[-92.958210, 45.363131]}/>*/}
					{/*</Layer>*/}
				</Map>
			</div>
		);
	}
}

export default MapDisplay;

