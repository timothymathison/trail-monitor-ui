import React, {Component} from 'react';
import ToggleButton from 'react-toggle-button'

class ControlToggle extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value : props.value
		}
	}

	handler = (value) => {
		this.setState({ value : !value })
	};

	render() {
		return(
			<div id="toggle" className="flexDefault">
				<h4>Control Something</h4>
				<ToggleButton
					value={ this.state.value }
					onToggle={ this.handler }
					colors={{
						active: {
							base: '#365ba5'
						}
					}}
				/>
			</div>
		);
	}
}

export default ControlToggle;
