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

	clearDropdown()
	{
		document.getElementById("dropdown").style.display = "none";
		this.props.parent.forceUpdate();
		this.props.updateStandings();
	}

	renderOption(scoreWin, scoreLose)
	{
		var scoreLeft = (this.props.left ? scoreWin : scoreLose)
		var scoreRight = (this.props.left ? scoreLose : scoreWin)

		return (
			<DropdownOption 
				leftScore={scoreLeft} 
				rightScore={scoreRight} 
				parent={this.props.parent}
				key={scoreLeft * 10 + scoreRight}
			/>
		);
	}

	render()
	{
		var matchDiv = document.getElementById("match_" + this.props.match.id);
		var rect = matchDiv.getBoundingClientRect();
		var index = this.props.left ? 0 : 1;
		var team = this.props.parent.props.match.competitors[index];

		document.getElementById("dropdown").style.display = "block";

		var scores = [
			this.renderOption(4, 0),
			this.renderOption(3, 1),
			this.renderOption(3, 2),
			this.renderOption(3, 0),
			this.renderOption(2, 1),
			this.renderOption(2, 0),
			//this.renderOption(1, 0),
			this.renderOption(0, 0),
		];

		var backgroundColor = team.primaryColor;
		var textColor = utils.areContrasting(backgroundColor, team.secondaryColor) ? "#" +team.secondaryColor : utils.isBright(backgroundColor) ? "black" : "white";

		var wrapperStyle = {
			left: document.body.scrollLeft + rect.x + 2,
			top: document.body.scrollTop + rect.y - 4,
		};

		var bottomDivStyle = {
			backgroundColor: backgroundColor,
			color: textColor,
		};

		return (
			<div className="dropdownWrapper" style={wrapperStyle} onMouseLeave={() => this.clearDropdown()} onMouseUp={() => this.clearDropdown()}>
				<div className="dropdownSpacer" />
				<div className="dropdownOptionContainer" style={bottomDivStyle}>
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
	}


	render()
	{
		var scores = this.props.leftScore + " - " + this.props.rightScore;
		if(this.props.leftScore === 0 && this.props.rightScore === 0)
		{
			scores = "Reset Game";
		}

		return (
			<div
				className="dropdownOption" 
				onMouseUp={() => this.handleMouseUp()} 
			>
				{scores}
			</div>
		);
	}
}

export default Dropdown;