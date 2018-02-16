import React, {Component} from 'react';
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoidGltb3RoeW1hdGhpc29uIiwiYSI6ImNqZGc3OWp3NzBoMXcycG5xMHBwbG90cHAifQ.9GqvGqNIxpezA5ofbe0Wbg"
});

class MapDisplay extends Component {
	defaultZoom = 8;

	constructor(props) {
		super(props);
		this.state = {
		};
	}

	componentWillReceiveProps(newProps) {

	}

	shouldComponentUpdate(newProps, newState) {
		return true;
	}

	render() {
		return(
			<div id="map-container">
				<Map
					style = "mapbox://styles/mapbox/outdoors-v10"
					containerStyle = {{
						height: "100%",
						width: "100%"
					}}
					center = {[-92.958210, 45.363131]}>
					{/*<Layer*/}
						{/*type="symbol"*/}
						{/*id="marker"*/}
						{/*layout={{ "icon-image": "marker-15" }}>*/}
						{/*<Feature coordinates={[45.363131, -92.958210]}/>*/}
					{/*</Layer>*/}
				</Map>
			</div>
		);
	}
}

export default MapDisplay;

