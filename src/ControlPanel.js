import React, {Component} from 'react';

import ControlToggle from './ControlToggle'

class ControlPanel extends Component {
	render() {
		return(
			<div id="control-panel" className="flexDefault">
				<ControlToggle value={ false }/>
			</div>
		);
	}
}

export default ControlPanel;
