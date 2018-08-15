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
		// var teamList = [];
		// for(var i = 0; i < this.props.teams.competitors.length; i++)
		// {
		// 	var team = this.props.teams.competitors[i];
		// 	teamList.push(<Team key={team.competitor.id} data={team} />);
		// }
		// console.log(teamList);
		// console.log(this.props.teams);
		// return <div>{teamList}</div>;

		var stageList = [];
		for(var i = 0; i < this.props.schedule.data.stages.length; i++)
		{
			var stage = this.props.schedule.data.stages[i];
			if(stage.slug.startsWith("stage"))
			{
				stageList.push(<Stage key={stage.id} stage={stage} />);
			}
		}
		console.log(stageList);
		console.log(this.props.teams);
		return <div>{stageList}</div>;


	}
}

class Stage extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log(props);
	}
	render()
	{
		var weekList = [];
		for(var i = 0; i < this.props.stage.weeks.length; i++)
		{
			var week = this.props.stage.weeks[i];
			weekList.push(<Week key={week.id} week={week} />);
		}
		return <div>{weekList}</div>;
	}
}

class Week extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log(props);
	}
	render()
	{
		var matchList = [];
		for(var i = 0; i < this.props.week.matches.length; i++)
		{
			var match = this.props.week.matches[i];
			if(match.conclusionStrategy === "MINIMUM")
			{
				matchList.push(<Match key={match.id} match={match} />)
			}
		}
		return <div>{matchList}</div>;
	}
}

class Match extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log(props);
	}
	render()
	{
		var divStyle = {
			padding: "5px",
			display: "block",
			width: "82px",
		};
		return (
			<div style={divStyle}>
				<Team key={this.props.match.competitors[0].id} team={this.props.match.competitors[0]} />
				<Team key={this.props.match.competitors[1].id} team={this.props.match.competitors[1]} />
			</div>
		);
	}
}

class Team extends React.Component 
{	
	constructor(props)
	{
		super(props);
		console.log(props);
	}
	render()
	{
		var divStyle = {
			backgroundColor: "#" + this.props.team.primaryColor,
			padding: "5px",
			float: "left",
		};
		var imgStyle = {
			backgroundColor: "white",
			height: "25px",
			borderRadius: "3px",
			border: "3px solid #" + this.props.team.secondaryColor,
		};
		return<div style={divStyle}><img style={imgStyle} src={this.props.team.secondaryPhoto}/></div>;
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
