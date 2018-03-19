import React, {Component} from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class SelectOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: props.default
		}
	}

	handleChange = (selected) => {
		if(this.state.selected.value !== selected.value) {
			this.setState({ selected: selected });
			this.props.handler(selected.value);
		}
	};

	renderSelect = () => {
		return(
			<Select name="Time Span" className="dark"
			        value={this.state.selected && this.state.selected.value}
			        onChange={this.handleChange}
			        removeSelected={true}
			        clearable={false}
			        options={this.props.options}
			/>
		);
	};

	render() {
		return (
			<div className="select">
				{this.renderSelect()}
			</div>
		);
	}
}

export default SelectOptions;
