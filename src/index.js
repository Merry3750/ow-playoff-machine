import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Dropdown from './dropdown.js';
import * as utils from "./utils.js";

var g_matchComponents = [];
var g_standingsComponent;

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
			<div>
				<div>{stageList}</div>
			</div>
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
		g_matchComponents.push(this);
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

	componentDidUpdate()
	{
		g_standingsComponent.forceUpdate();
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
			color: (utils.areContrasting(backgroundColor, textColor) ? textColor : utils.isBright(backgroundColor) ? "black" : "white"),
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

class Standings extends React.Component 
{
	constructor(props)
	{
		super(props);
		g_standingsComponent = this;
	}

	render()
	{

		var teams = this.props.teams.competitors;
		for(var j = 0; j < teams.length; j++)
		{
			teams[j].competitor.wins = 0;
			teams[j].competitor.losses = 0;
			teams[j].competitor.matchDiff = 0;
		}

		for(var i = 0; i < g_matchComponents.length; i++)
		{
			var match = g_matchComponents[i].props.match;
			for (var j = 0; j < teams.length; j++)
			{
				if(match.competitors[0].id == teams[j].competitor.id || match.competitors[1].id == teams[j].competitor.id)
				{
					var index = (match.competitors[0].id == teams[j].competitor.id ? 0 : 1);
					var otherIndex = 1 - index;
					
					if(match.scores[index].value > match.scores[otherIndex].value)
					{
						teams[j].competitor.wins++;
					}
					else
					{
						teams[j].competitor.losses++;
					}

					teams[j].competitor.matchDiff += match.scores[index].value - match.scores[otherIndex].value;
				}
			}
		}

		teams.sort(function(a,b)
		{
			if(a.competitor.wins != b.competitor.wins)
			{
				return b.competitor.wins - a.competitor.wins;
			}
			else if(a.competitor.matchDiff != b.competitor.matchDiff)
			{
				return b.competitor.matchDiff - a.competitor.matchDiff;
			}
			else
			{
				//TODO: add tiebreaker here
				return -1;
			}
		});

		var standingPlaces = [];
		for(var j = 0; j < teams.length; j++)
		{
			var isTop = (j == 0);
			standingPlaces.push(<StandingPlace key={teams[j].competitor.id} team={teams[j]} isTop={isTop} />);
		}

		var divStyle = {
			marginTop: "5px",
			maxWidth: "500px",
		};

		return (
			<div style={divStyle}>{standingPlaces}</div>
		);
	}
}

class StandingPlace extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		var team = this.props.team.competitor;	
		team.matchDiff = (team.matchDiff > 0 ? "+" + team.matchDiff : team.matchDiff);

		var wrapperStyle = {
			backgroundColor: "#bbbbbb",
			padding: "3px",
			border: "2px solid black",
			borderTop: (this.props.isTop ? "2px solid black" : ""),
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
		var textStyle = {
			color: "black",
			fontSize: "20px",
			fontFamily: "sans-serif",
			verticalAlign: "middle",
			margin: "3px",
			display:"inline-block",
			textAlign: "center",
		};
		var scoreWrapperStyle = {
			color: "black",
			fontSize: "20px",
			fontFamily: "sans-serif",
			verticalAlign: "middle",
			margin: "3px",
			display:"inline-block",
			textAlign: "center",
			float: "right",
		};
		var scoreStyle = {
			display:"inline-block",
			width: "50px",
		};
		return (
			<div style={wrapperStyle}>
				<div style={imgStyle} />
				<div style={textStyle}>{team.name}</div>
				<div style={scoreWrapperStyle}>
					<div style={scoreStyle}>{team.wins}</div>
					<div style={scoreStyle}>{team.losses}</div>
					<div style={scoreStyle}>{team.matchDiff}</div>
				</div>
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
				ReactDOM.render(<Standings teams={resultTeams}/>, document.getElementById("standings"));
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
