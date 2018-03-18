import React, {Component} from 'react';
import { HashLoader, RingLoader } from 'react-spinners';

class LoadIcon extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: props.isLoading
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({ loading: newProps.isLoading });
	}

	shouldComponentUpdate(newProps) {
		return newProps.isLoading !== this.state.loading;
	}

	render() {
		return (
			<div className="loading">
				<RingLoader color="#2a57ab" size={100} loading={this.state.loading}/>
				{/*<br/>*/}
				{/*Building Visual...*/}
			</div>
		);
	}
}

export default LoadIcon
