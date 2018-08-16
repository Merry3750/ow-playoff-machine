import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';

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
			<div>{stageList}</div>
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
		//console.log(props);
	}
	render()
	{
		var match = this.props.match;
		var scoreA = match.scores[0].value;
		var scoreB = match.scores[1].value;
		var divStyle = {
			padding: "2px",
			display: "block",
			overflow:"auto",
		};
		return (
			<div style={divStyle}>
				<Team key={match.competitors[0].id} team={match.competitors[0]} score={scoreA} left={true}  winner={scoreA > scoreB}/>
				<Team key={match.competitors[1].id} team={match.competitors[1]} score={scoreB} left={false} winner={scoreB > scoreA}/>
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
			borderTop: "2px solid #" + team.primaryColor,
			borderBottom: "2px solid #" + team.primaryColor,
			borderLeft: (this.props.left ? "2px solid #" + team.primaryColor : ""),
			borderRight: (this.props.left ? "" : "2px solid #" + team.primaryColor),
			backgroundColor: backgroundColor,
			padding: "3px",
			float: "left",
		};
		var divStyle = {
			backgroundColor: backgroundColor,
		};
		var imgStyle = {
			backgroundColor: "white",
			height: "30px",
			borderRadius: "3px",
			margin: "auto",
			verticalAlign: "middle",
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

		var image = <img style={imgStyle} src={team.secondaryPhoto}/>;
		var score = <span style={scoreStyle}>{this.props.score}</span>;
		if(this.props.left)
		{
			return (
				<div style={wrapperStyle}><div style={divStyle}>{image}{score}</div></div>
			);
		}
		else
		{
			return (
				<div style={wrapperStyle}><div style={divStyle}>{score}{image}</div></div>
			);
		}
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