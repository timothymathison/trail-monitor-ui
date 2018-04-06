import React, {Component} from 'react';

class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text,
            className: props.className
        }
    }

    componentWillReceiveProps(newProps) {
        if(newProps.text !== this.state.text || newProps.className !== this.state.className) {
            this.setState({ text: newProps.text, className: newProps.className });
        }
    }

    render() {
        return (
            <button id={this.props.id} className={"button " + (this.state.className ? this.state.className : "")} onClick={this.props.handler}>
                {this.props.symbol ? <img src={this.props.symbol} alt=""/> : ""}
                {this.state.text}
            </button>
        );
    }
}

export default Button
