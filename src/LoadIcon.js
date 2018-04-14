import React, {Component} from 'react';
import { PropagateLoader } from 'react-spinners';

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
			<div onScroll={() => {}} className={this.state.loading ? "loading" : "hidden"}>
				<PropagateLoader color="#0984e3" size={30} loading={this.state.loading}/>
				{/*<br/>*/}
				{/*Building Visual...*/}
			</div>
		);
	}
}

export default LoadIcon
