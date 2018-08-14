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
		var teamList = [];
		for(var i = 0; i < this.props.teams.competitors.length; i++)
		{
			var team = this.props.teams.competitors[i];
			teamList.push(<Team key={team.competitor.id} data={team} />)
		}
		console.log(teamList);
		console.log(this.props.teams);
		return <div style={{color:'blue'}}>{teamList}</div>;
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
			backgroundColor: "#" + this.props.data.competitor.primaryColor,
			padding: "5px",
		};
		var imgStyle = {
			backgroundColor: "white",
			height: "100px",
			borderRadius: "5px",
			border: "5px solid #" + this.props.data.competitor.secondaryColor
		};
		return<div style={divStyle}><img style={imgStyle} src={this.props.data.competitor.secondaryPhoto}/></div>;
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
