import React, {Component} from 'react';
import ToggleButton from 'react-toggle-button'

class ControlToggle extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({ value: newProps.value });
	}

	shouldComponentUpdate(newProps, newState) {
		return newProps.value !== this.state.value;
	}

	handler = (value) => {
		this.setState({ value: !value });
		this.props.handler(!value);
	};

	render() {
		console.log("Toggle render called");
		return(
			<div id="toggle" className="flexDefault">
				<h4>{this.props.label}</h4>
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
