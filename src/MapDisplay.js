import React, {Component, Fragment} from 'react';
import ReactMapboxGl, { Layer, ZoomControl, Feature, Source } from "react-mapbox-gl";

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoidGltb3RoeW1hdGhpc29uIiwiYSI6ImNqZGc3OWp3NzBoMXcycG5xMHBwbG90cHAifQ.9GqvGqNIxpezA5ofbe0Wbg"
});

class MapDisplay extends Component {
	defaultZoom = [16];

	constructor(props) {
		super(props);
		this.state = {
			geoJsonData: this.buildData(props.data),
			dataType: props.dataType
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({ data: this.buildData(newProps.data) });
	}

	shouldComponentUpdate(newProps, newState) {
		return true;
	}

	buildData = (rawData) => {
		return {
			"type": "geojson",
			"data": {
				"type": "Feature",
				"geometry": {
					"type": "MultiPoint",
					"coordinates": [
						[-92.958210, 45.363131],
						[-92.958210, 45.364131],
						[-92.958210, 45.365131],
						[-92.958210, 45.366131]
					]
				}
				// "properties": {
				// 	"title": "Mapbox DC",
				// 	"marker-symbol": "monument"
				// }
			}
		};
	};

	plotCircles = () => {
		return (
			<React.Fragment>
				<Source id="dotData" geoJsonSource={this.state.geoJsonData}/>
				<Layer id="dotLayer" sourceId="dotData" type="circle" paint={{'circle-radius': {'base': 1.75, 'stops': [[12, 2], [22, 180]]}, "circle-color": "#ff0000"}}>
				</Layer>
			</React.Fragment>
		);
	};

	render() {
		return(
			<div id="map-container">
				<Map
					style = "mapbox://styles/mapbox/outdoors-v10"
					containerStyle = {{height: "100%", width: "100%"}}
					center = {[-92.958210, 45.363131]}
					zoom = {this.defaultZoom}>
					<ZoomControl/>
					{this.plotCircles()}

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

