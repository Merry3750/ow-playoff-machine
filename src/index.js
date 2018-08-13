import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';

class Thing extends React.Component 
{
	render()
	{
		return <div style={{color:'blue'}}>Hello world</div>;
	}
}


ReactDOM.render(<Thing />, document.getElementById("react"));