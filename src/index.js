import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';

class Thing extends React.Component 
{
	render()
	{
		let style = {color:'red'};
		return <div style={style}>Hello world</div>;
	}
}


ReactDOM.render(<Thing />, document.getElementById("react"));