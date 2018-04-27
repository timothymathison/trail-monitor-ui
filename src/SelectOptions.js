import React, {Component} from 'react';

const btnStyle = {
	minWidth: "3em",
	height: "2em",
	margin: "2.5px 0",
	padding: "0.4em 0",
	fontSize: "1em",
	borderStyle: "solid",
	borderWidth: "1px",
	boxSizing: "border-box",
	cursor: "pointer"
};

class SelectOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: props.default.value,
			options: props.options
		}
	}

    shouldComponentUpdate(newProps, newState) {
		return this.state.selected !== newState.selected
			|| this.state.options.length !== newState.options.length;
    }

	handleChange = (selected) => {
		let val = selected.target.id;
		if(this.state.selected !== val) {
            this.setState({ selected: val });
            this.props.handler(val);
		}
	};

	renderBtnSelect = () => {
		let options = this.state.options;
		let selections = [];
		let width = (100 / (options.length > 0 ? options.length : 1)).toString() + "%";

        let option;
        let className;
		for(let i = 0; i < options.length; i++) {
        	option = options[i];

            let elemStyle = Object.assign({}, btnStyle);
            elemStyle.width = width;
            elemStyle.borderColor = this.props.colors.active;
            if(option.value === this.state.selected) {
                elemStyle.backgroundColor = this.props.colors.active;
                className = "btn-option-selected";
            } else {
            	elemStyle.backgroundColor = this.props.colors.inactive;
                className = "btn-option";
            }

            selections.push(<div key={option.value} id={option.value} className={className} style={elemStyle} onClick={this.handleChange}>{option.label}</div>)
		}
		return selections;
	};

	render() {
		return (
			<div className="select">
				<h4 style={{width: "100%", margin: "0"}}>{this.props.name}</h4>
				{this.renderBtnSelect()}
			</div>
		);
	}
}

export default SelectOptions;
