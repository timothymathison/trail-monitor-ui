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

	shouldComponentUpdate(newProps) {
		return newProps.value !== this.state.value;
	}

	handler = (value) => {
		this.setState({ value: !value });
		this.props.handler(!value);
	};

	renderOnOff = () => {
		return (
			<ToggleButton
				inactiveLabel={<X/>}
				activeLabel={<Check/>}
				value={ this.state.value }
				onToggle={ this.handler }
				colors={{
					active: {
						base: '#2a57ab'//'#365ba5'
					}
				}}
			/>
		)
	};

	renderSelect = () => {
		return (
			<ToggleButton
				activeLabel={<div className="veryBold">{this.props.innerLabels[0]}</div>}
				inactiveLabel={<div className="veryBold">{this.props.innerLabels[1]}</div>}
				value={ this.state.value }
				onToggle={ this.handler }
				colors={{
					active: {
						base: this.props.colors[0]
					},
					inactive: {
						base: this.props.colors[1]
					}
				}}
			/>
		);
	};

	render() {
		return(
			<div className="toggle flexDefault">
				<h4>{this.props.label}</h4>
				{this.props.type !== "select" ? this.renderOnOff() : this.renderSelect()}
			</div>
		);
	}
}

class Check extends Component {
	check = "\u2714";
	render() {
		return <div className="veryBold">{this.check}</div>
	}
}

class X extends Component {
	x = "X";
	render() {
		return <div className="veryBold">{this.x}</div>
	}
}

export default ControlToggle;
