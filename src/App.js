import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import Utility from './Utility.js';
import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js';

class App extends Component {
	cache = {};

	constructor(props) {
		super(props);
		this.state = {
			displayAll: false
		};
	}

	displayAllHandler = (newValue) => {
		this.setState({ displayAll: newValue });
		console.log("Display data value: " + newValue);
	};

	render() {
		return (
            <div id="App">
                <header id="App-header">
                    <img src={polaris} id="polaris-logo" alt="polaris-logo"/>
                    <h1 className="App-title">Trail Monitor</h1>
                    <img src={logo} id="react-logo" alt="react-logo"/>

                </header>
	            <div id="App-body">
		            <ControlPanel displayAll={this.state.displayAll} displayAllHandler={this.displayAllHandler}/>
		            <MapDisplay dataType="trailRoughness" trailPointData={Utility.buildData({})} dataVisible={this.state.displayAll}/>
	            </div>

            </div>
		);
	}
}

export default App;
