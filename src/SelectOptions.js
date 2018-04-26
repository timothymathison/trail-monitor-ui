import React, {Component} from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const btnStyle = {
	minWidth: "3em",
	height: "2em",
	margin: "10px, 0",
	padding: "0.4em 0",
	fontSize: "1em",
	border: "solid #0984e3 1px",
	boxSizing: "border-box",
	backgroundColor: "#2d3436"
};

class SelectOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: props.default,
			options: props.options
		}
	}

    shouldComponentUpdate(newProps, newState) {
		return this.state.options.length !== newState.options.length;
    }

	handleChange = (selected) => {
		console.log(selected.target.id);
		// if(this.state.selected.value !== selected.value) {
		// 	this.setState({ selected: selected });
		// 	this.props.handler(selected.value);
		// }
	};

	renderSelect = () => {
		//TODO: use non-drop-down style select
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

	renderBtnSelect = () => {
		let options = this.state.options;
		let selections = [];
		let style = btnStyle;
		style.width = (100 / (options.length > 0 ? options.length : 1)).toString() + "%";
        let className;
        let option;
		for(let i = 0; i < options.length; i++) {
        	option = options[i];
        	if(option.value === this.state.selected.value) {
                className = "btn-option-selected"
	        } else {
                className = "btn-option";
            }

            selections.push(<div key={option.value} id={option.value} className={className} style={style} onClick={this.handleChange}>{option.label}</div>)
		}
		return selections;
	};

	render() {
		return (
			<div className="select">
				{/*{this.renderSelect()}*/}
				{this.renderBtnSelect()}
			</div>
		);
	}
}

export default SelectOptions;
