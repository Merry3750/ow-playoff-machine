import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';

class Thing extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log(props);
	}
	render()
	{
		var stageList = [];
		for(var i = 0; i < this.props.schedule.data.stages.length; i++)
		{
			var stage = this.props.schedule.data.stages[i];
			if(stage.slug.startsWith("stage"))
			{
				stageList.push(<Stage key={stage.id} stage={stage} />);
			}
		}

		return (
			<div style={{width: "1000px"}}>{stageList}</div>
		);
	}
}

class Stage extends React.Component 
{
	constructor(props)
	{
		super(props);
		//console.log(props);
	}
	render()
	{
		var divStyle = {
			border: "1px solid black",
			//height:"542px"
			overflow:"auto",

			// -webkit-touch-callout: none; /* iOS Safari */
			// -webkit-user-select: none; /* Safari */
			// -khtml-user-select: none; /* Konqueror HTML */
			// -moz-user-select: none; /* Firefox */
			// -ms-user-select: none; /* Internet Explorer/Edge */
			userSelect: "none", /* Non-prefixed version, currently supported by Chrome and Opera */

		}
		var weekList = [];
		for(var i = 0; i < this.props.stage.weeks.length; i++)
		{
			var week = this.props.stage.weeks[i];
			weekList.push(<Week key={week.id} week={week} />);
		}

		return (
			<div style={divStyle}>{weekList}</div>
		);
	}
}

class Week extends React.Component 
{
	constructor(props)
	{
		super(props);
		//console.log(props);
	}
	render()
	{
		var divStyle = {
			border: "1px dashed black",
			float: "left",
			padding: "5px",
			margin: "5px",
			overflow:"auto",
		}
		var matchList = [];
		for(var i = 0; i < this.props.week.matches.length; i++)
		{
			var match = this.props.week.matches[i];
			if(match.conclusionStrategy === "MINIMUM")
			{
				matchList.push(<Match key={match.id} match={match} />)
			}
		}
		return (
			<div style={divStyle}>{matchList}</div>
		);
	}
}

class Match extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	handleclick(left)
	{
		var index = (left ? 0 : 1);
		var other = (left ? 1 : 0);
		this.props.match.scores[index].value = 4;
		this.props.match.scores[other].value = 0;
		this.forceUpdate();
		//ReactDOM.render(<Dropdown match={this.props.match}/>, document.getElementById("dropdown"));
	}

	handleMouseDown(left, e)
	{
		var component = this;
		var dropdownTimeout = setTimeout(function()
		{
			ReactDOM.render(<Dropdown match={component.props.match} parent={component} left={left}/>, document.getElementById("dropdown"));
		}, 75);

		var cancelDropdown = function()
		{
			clearTimeout(dropdownTimeout);
		}
		window.onmouseup = cancelDropdown;
		e.target.onmouseleave = cancelDropdown;
	}

	render()
	{
		var match = this.props.match;
		var scoreA = match.scores[0].value;
		var scoreB = match.scores[1].value;
		var id="match_" + match.id;

		var divStyle = {
			padding: "2px",
			display: "block",
			overflow:"auto",
		};

		return (
			<div style={divStyle} id={id}>
				<Team 
					key={match.competitors[0].id} 
					team={match.competitors[0]} 
					score={scoreA} 
					match={match}
					left={true}  
					winner={scoreA > scoreB}
					onClick={() => this.handleclick(true)}
					onMouseDown={(e) => this.handleMouseDown(true, e)}
				/>
				<Team 
					key={match.competitors[1].id} 
					team={match.competitors[1]} 
					score={scoreB}  
					match={match}
					left={false} 
					winner={scoreB > scoreA}
					onClick={() => this.handleclick(false)}
					onMouseDown={(e) => this.handleMouseDown(false, e)}
				/>
			</div>
		);
	}
}

class Team extends React.Component 
{	
	constructor(props)
	{
		super(props);
		//console.log(props);
	}
	render()
	{
		var team = this.props.team;
		var backgroundColor = (this.props.winner ? "#" + team.primaryColor : "#bbbbbb");
		var textColor = (this.props.winner ? "#" + team.secondaryColor : "#000000");
		var wrapperStyle = {
			border: "2px solid #" + team.primaryColor,
			borderLeft: (this.props.left ? "2px solid #" + team.primaryColor : ""),
			borderRight: (this.props.left ? "" : "2px solid #" + team.primaryColor),
			backgroundColor: backgroundColor,
			padding: "3px",
			float: "left",
			borderTopLeftRadius: (this.props.left ? "3px" : ""),
			borderBottomLeftRadius: (this.props.left ? "3px" : ""),
			borderTopRightRadius: (this.props.left ? "" : "3px"),
			borderBottomRightRadius: (this.props.left ? "" : "3px"),
		};
		var divStyle = {
			backgroundColor: backgroundColor,
		};
		var imgStyle = {
			backgroundColor: "white",
			height: "30px",
			width: "30px",
			borderRadius: "3px",
			margin: "auto",
			verticalAlign: "middle",
			backgroundImage: "url(" + team.secondaryPhoto + ")",
			backgroundSize: "100%",
			display: "inline-block",
		};
		var scoreStyle = {
			color: (areContrasting(backgroundColor, textColor) ? textColor : isBright(backgroundColor) ? "black" : "white"),
			fontSize: "20px",
			fontFamily: "sans-serif",
			width: "20px",
			verticalAlign: "middle",
			margin: "3px",
			display:"inline-block",
			textAlign: "center",
		};

		var innerDiv;
		var image = <span style={imgStyle}/>;
		var score = <span style={scoreStyle}>{this.props.score}</span>;
		if(this.props.left)
		{
			innerDiv = <div style={divStyle}>{image}{score}</div>
		}
		else
		{
			innerDiv = <div style={divStyle}>{score}{image}</div>
		}
		return (
			<div 
				style={wrapperStyle} 
				onClick={this.props.onClick} 
				onMouseDown={this.props.onMouseDown} >{innerDiv}
			</div>
		);
	}
}

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
		var textColor = areContrasting(backgroundColor, team.secondaryColor) ? "#" +team.secondaryColor : isBright(backgroundColor) ? "black" : "white";

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

fetch("https://api.overwatchleague.com/teams").then(response => response.json()).then(
	(resultTeams) => 
	{
		fetch("https://api.overwatchleague.com/schedule").then(response => response.json()).then(
			(resultSchedule) => 
			{
				ReactDOM.render(<Thing schedule={resultSchedule} teams={resultTeams} />, document.getElementById("react"));
			},
			(error) => {
				console.log(error);
			}
		);
	},
	(error) => {
		console.log(error);
	}
);

//if this is wrong, blame this guy https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
function isBright(color)
{
	return getBrightness(color) > 90;
}

function areContrasting(colorA, colorB)
{
	var brightnessA = getBrightness(colorA);
	var brightnessB = getBrightness(colorB);

	return Math.abs(brightnessA	- brightnessB) > 90;
}

function getBrightness(color)
{
	if(color.startsWith("#"))
	{
		color = color.substring(1);
	}

	var r = parseInt(color.substring(0,2), 16);
	var g = parseInt(color.substring(2,4), 16);
	var b = parseInt(color.substring(4,6), 16);

	return (r * 299 + g * 587 + b * 114) / 1000;
}