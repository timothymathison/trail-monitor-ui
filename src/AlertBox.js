import React, {Component} from 'react';

class AlertBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.alertId,
            type: "success",
            message: "",
            timeout: "",
            show: false
        }
    }

    componentWillReceiveProps(newProps) {
        if(newProps.alertId >  this.state.id) {
            this.setState({ id: newProps.alertId,
                type: newProps.type,
                message: newProps.message,
                timeout: newProps.timeout,
                show: true });
        }
    }

    renderAlert = () => {
        if(this.state.show) {
            if(this.state.timeout && this.state.timeout !== null) {
                setTimeout(() => {
                    this.setState({ show: false });
                }, this.state.timeout);
            }
            return (
                <div className={this.state.type + " alert-box"}>
                    {this.state.message}
                </div>
            );
        } else {
            return <div className="hidden alert-box">hidden</div>;
        }
    };

    render() {
        return this.renderAlert();
    }
}

export default AlertBox;
