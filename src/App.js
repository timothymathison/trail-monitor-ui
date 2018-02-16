import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import ControlPanel from './ControlPanel.js';
import MapDisplay from './MapDisplay.js'

class App extends Component {
	cache = {};

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	render() {
		return (
            <div id="App">
                <header id="App-header">
                    <img src={polaris} id="polaris-logo" alt="polaris-logo"/>
                    <h1 className="App-title">Trail Monitor</h1>
                    <img src={logo} id="react-logo" alt="react-logo"/>

                </header>
	            <div id="App-body">
		            <ControlPanel/>
		            <MapDisplay dataType="circle"/>
	            </div>

            </div>
		);
	}
}

export default App;
