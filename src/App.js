import React, {Component} from 'react';

import logo from './logo.svg';
import polaris from './polaris.png';
import './App.css';

import ControlPanel from 'ControlPanel.js';
import MapDisplay from 'MapDisplay.js'

class App extends Component {
	render() {
		return (
            <div id="App">
                <header id="App-header">
                    <img src={polaris} id="polaris-logo" alt="polaris-logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                    <img src={logo} id="react-logo" alt="react-logo"/>

                </header>
                <ControlPanel/>
                <MapDisplay/>
            </div>
		);
	}
}

export default App;
