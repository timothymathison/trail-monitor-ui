import React, {Component} from 'react';

class Button extends Component {
    timeout = false;

    throttleHandler = () => {
        if(!this.timeout) {
            this.timeout = true;
            setTimeout(() => {this.timeout = false;}, 2500);
            this.props.handler();
        }
    };

    render() {
        return <button className="button" onClick={this.props.handler}>{this.props.text}</button>
    }
}

export default Button
