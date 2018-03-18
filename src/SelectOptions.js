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
		this.setState({ selected: selected });
		console.log("Time: ", selected, "selected");
	};

	renderSelect = () => {
		return(
			<Select name="Time Span"
			        value={this.state.selected && this.state.selected.value}
			        onChange={this.handleChange}
			        options={[
				        {value: "pastDay", label: "Past 24 Hours"},
				        {value: "pastWeek", label: "Past 7 Days"},
				        {value: "pastMonth", label: "Past 30 Days"},
				        {value: "pastYear", label: "Past Year"},
				        {value: "allTime", label: "All Time"}
			        ]}
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
