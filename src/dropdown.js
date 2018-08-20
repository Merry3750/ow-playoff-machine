import React from 'react';
import './styles/dropdown.css';
import * as utils from "./utils.js";

class Dropdown extends React.Component 
{
	constructor(props)
	{
		super(props);
		//console.log(props);
	}

	handleMouseLeave()
	{
		document.getElementById("dropdown").style.display = "none";
	}

	handleMouseUp()
	{
		document.getElementById("dropdown").style.display = "none";
	}

	render()
	{
		var matchDiv = document.getElementById("match_" + this.props.match.id);
		var rect = matchDiv.getBoundingClientRect();
		var index = this.props.left ? 0 : 1;
		var team = this.props.parent.props.match.competitors[index];

		document.getElementById("dropdown").style.display = "block";

		var scores = [
			<DropdownOption 
				leftScore={(this.props.left ? 4 : 0)} 
				rightScore={(this.props.left ? 0 : 4)} 
				parent = {this.props.parent}
				key={0}
			/>,
			<DropdownOption 
				leftScore={(this.props.left ? 3 : 1)} 
				rightScore={(this.props.left ? 1 : 3)} 
				parent = {this.props.parent}  
				key={1}
			/>,
			<DropdownOption 
				leftScore={(this.props.left ? 3 : 2)} 
				rightScore={(this.props.left ? 2 : 3)} 
				parent = {this.props.parent}
				key={2}
			/>,
			<DropdownOption 
				leftScore={(this.props.left ? 3 : 0)} 
				rightScore={(this.props.left ? 0 : 3)} 
				parent = {this.props.parent}
				key={3}
			/>,
			<DropdownOption
				leftScore={(this.props.left ? 2 : 1)} 
				rightScore={(this.props.left ? 1 : 2)} 
				parent = {this.props.parent}
				key={4}
			/>,
			<DropdownOption 
				leftScore={(this.props.left ? 2 : 0)} 
				rightScore={(this.props.left ? 0 : 2)} 
				parent = {this.props.parent}
				key={5}
			/>,
			// <DropdownOption 
			// 	leftScore={(this.props.left ? 1 : 0)} 
			// 	rightScore={(this.props.left ? 0 : 1)} 
			// 	parent = {this.props.parent}
			//	key={6}
			// />,
			<DropdownOption 
				leftScore = {0} 
				rightScore = {0} 
				parent = {this.props.parent}
				key={7}
			/>,
		];

		var backgroundColor = team.primaryColor;
		var textColor = utils.areContrasting(backgroundColor, team.secondaryColor) ? "#" +team.secondaryColor : utils.isBright(backgroundColor) ? "black" : "white";

		var wrapperStyle = {
			width: "124px",
			borderRadius: "3px",
			position: "absolute",
			left: document.body.scrollLeft + rect.x + 2,
			top: document.body.scrollTop + rect.y - 2,
		};

		var topDivStyle = {
			width: "100%",
			height: "44px",
		};

		var bottomDivStyle = {
			width: "100%",
			backgroundColor: backgroundColor,
			borderLeft: "2px solid " + textColor,
			borderRight: "2px solid " + textColor,
			borderBottom: "2px solid " + textColor,
			color: textColor,
		};

		return (
			<div style={wrapperStyle} onMouseLeave={() => this.handleMouseLeave()} onMouseUp={() => this.handleMouseUp()}>
				<div style={topDivStyle} />
				<div style={bottomDivStyle}>
					{scores}
				</div>
			</div>
		);
	}

}

class DropdownOption extends React.Component 
{
	constructor(props)
	{
		super(props);
		//console.log(props);
	}

	handleMouseUp()
	{
		this.props.parent.props.match.scores[0].value = this.props.leftScore;
		this.props.parent.props.match.scores[1].value = this.props.rightScore;
		this.props.parent.forceUpdate();
	}


	render()
	{			
		var divStyle = {
			fontSize: "20px",
			fontFamily: "sans-serif",
			textAlign: "center",
			width: "100%",
		};

		var scores = this.props.leftScore + " - " + this.props.rightScore;
		if(this.props.leftScore === 0 && this.props.rightScore === 0)
		{
			scores = "Reset Game";
		}

		return (
			<div
				style={divStyle} 
				className="dropdownOption" 
				onMouseUp={() => this.handleMouseUp()} 
			>
				{scores}
			</div>
		);
	}
}

export default Dropdown;