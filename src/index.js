import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Dropdown from './dropdown.js';
import Standings from './standings.js';
import * as utils from "./utils.js";

var g_matchComponents = [];
var g_standingsComponent;

class Schedule extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log(props);
		this.stageTabComponents = [];
		this.stageComponents = [];
	}

	componentDidMount()
	{
		this.stageTabComponents[0].setState({active: true});
		this.stageComponents[0].setState({active: true});
	}

	handleTabClick(component)
	{
		for(var i = 0; i < this.stageTabComponents.length; i++)
		{
			if(this.stageTabComponents[i] === component)
			{
				this.stageTabComponents[i].setState({active: true});
				this.stageComponents[i].setState({active: true});
			}
			else
			{
				this.stageTabComponents[i].setState({active: false});
				this.stageComponents[i].setState({active: false});
			}
		}
	}

	render()
	{
		var stageList = [];
		var stageTabList = [];
		for(var i = 0; i < this.props.schedule.data.stages.length; i++)
		{
			var stage = this.props.schedule.data.stages[i];
			if(stage.slug.startsWith("stage"))
			{
				stageTabList.push(<StageTab key={stage.id} stage={stage} ref={(s) => {this.stageTabComponents.push(s)}} onClick={(c) => this.handleTabClick(c) }/>);
				stageList.push(<Stage key={stage.id} stage={stage} teams={this.props.teams} ref={(s) => {this.stageComponents.push(s)}} />);
			}
		}


		return (
			<div>
				<div className="stageTabContainer">
					<div className="stageTabFillerleft"/> 
					<div className="stageTabWrapper">
						{stageTabList}
					</div>
					<div className="stageTabFillerRight"/>
				</div>
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
		this.matchComponents = [];
		this.standings;
		this.state = {active: false};
		//console.log(props);
	}

	addMatchComponent(component)
	{
		this.matchComponents.push(component);
	}

	updateStandings()
	{
		if(this.standings && this.standings.state.mounted)
		{
			this.standings.forceUpdate();
		}
		if(g_standingsComponent && g_standingsComponent.state.mounted)
		{
			g_standingsComponent.forceUpdate();
		}
	}

	render()
	{
		this.matchComponents = [];
		var divStyle = {
			display: (this.state.active ? "block" : "none"),
		}

		var weekList = [];
		for(var i = 0; i < this.props.stage.weeks.length; i++)
		{
			var week = this.props.stage.weeks[i];
			weekList.push(<Week key={week.id} week={week} addMatchComponent={(c) => this.addMatchComponent(c)} updateStandings={() => this.updateStandings()} />);
		}

		var stageType = this.props.stage.id <= 2 ? "OWL_StageA" : "OWL_StageB";

		var stageList = <Standings matchComponents={this.matchComponents} teams={this.props.teams} ref={(s) => this.standings = s} type={stageType} global={false} />

		return (
			<div className="stage" style={divStyle}>
				{weekList}
				{stageList}
			</div>

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
		var matchList = [];
		for(var i = 0; i < this.props.week.matches.length; i++)
		{
			var match = this.props.week.matches[i];
			if(match.conclusionStrategy === "MINIMUM")
			{
				var matchComponent = <Match key={match.id} match={match} updateStandings={() => this.props.updateStandings()}/>;
				this.props.addMatchComponent(matchComponent);
				matchList.push(matchComponent);
			}
		}
		return (
			<div className="week">{matchList}</div>
		);
	}
}

class Match extends React.Component 
{
	constructor(props)
	{
		super(props);
		g_matchComponents.push(this);
		this.children = [];
	}

	handleclick(left)
	{
		var index = (left ? 0 : 1);
		var other = (left ? 1 : 0);
		this.props.match.scores[index].value = 4;
		this.props.match.scores[other].value = 0;
		this.forceUpdate();
		this.updateStandings();
		//ReactDOM.render(<Dropdown match={this.props.match}/>, document.getElementById("dropdown"));
	}

	handleMouseDown(left, id, e)
	{
		var component = this;
		var dropdownTimeout = setTimeout(function()
		{
			ReactDOM.render(<Dropdown match={component.props.match} parent={component} left={left} updateStandings={() => component.updateStandings()}/>, document.getElementById("dropdown"));
			component.children[0].setState({clickTarget: id});
			component.children[1].setState({clickTarget: id});
		}, 150);

		var cancelDropdown = function()
		{
			clearTimeout(dropdownTimeout);
		};
		window.onmouseup = cancelDropdown;
		e.target.onmouseleave = cancelDropdown;
	}

	updateStandings()
	{
		this.children[0].setState({clickTarget: false});
		this.children[1].setState({clickTarget: false});
		this.props.updateStandings();
	}

	render()
	{
		var match = this.props.match;
		var scoreA = match.scores[0].value;
		var scoreB = match.scores[1].value;
		var id="match_" + match.id;

		return (
			<div className="match" id={id}>
				<Team 
					key={match.competitors[0].id} 
					team={match.competitors[0]} 
					score={scoreA} 
					match={match}
					left={true}  
					winner={scoreA > scoreB}
					onClick={() => this.handleclick(true)}
					onMouseDown={(e) => this.handleMouseDown(true, match.competitors[0].id, e)}
					ref={(t) => {this.children.push(t)}}
				/>
				<Team 
					key={match.competitors[1].id} 
					team={match.competitors[1]} 
					score={scoreB}  
					match={match}
					left={false} 
					winner={scoreB > scoreA}
					onClick={() => this.handleclick(false)}
					onMouseDown={(e) => this.handleMouseDown(false, match.competitors[1].id, e)}
					ref={(t) => {this.children.push(t)}}
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
		this.state = {clickTarget: false};
	}
	render()
	{
		var team = this.props.team;
		var getsColor = (this.state.clickTarget && this.state.clickTarget == team.id) ||  
						(!this.state.clickTarget && this.props.winner);
		var backgroundColor = (getsColor ? "#" + team.primaryColor : "#bbbbbb");
		var textColor = (getsColor ? "#" + team.secondaryColor : "#000000");
		var side = this.props.left ? " left" : " right";

		var wrapperStyle = {
			border: "2px solid #" + team.primaryColor,
			backgroundColor: backgroundColor,
		};
		var imgStyle = {
			backgroundImage: "url(" + team.secondaryPhoto + ")",
		};
		var scoreStyle = {
			color: (utils.areContrasting(backgroundColor, textColor) ? textColor : utils.isBright(backgroundColor) ? "black" : "white"),
		};

		var innerDiv;
		var image = <div className="image" style={imgStyle} />;
		var score = <div className="teamScore" style={scoreStyle}>{this.props.score}</div>;
		if(this.props.left)
		{
			innerDiv = <div>{image}{score}</div>
		}
		else
		{
			innerDiv = <div>{score}{image}</div>
		}
		return (
			<div 
				className={"team" + side}
				style={wrapperStyle} 
				onClick={this.props.onClick} 
				onMouseDown={this.props.onMouseDown} >{innerDiv}
			</div>
		);
	}
}

class StageTab extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {active: false};
	}

	render()
	{
		var activeClass = (this.state.active ? " active" : "")

		return (
			<div className={"stageTabFormatter" + activeClass}>
				<div className="stageTabSpacerLeft"></div>
				<div className="stageTab" onClick={() => this.props.onClick(this)} >{this.props.stage.name}</div>
				<div className="stageTabSpacerRight"></div>
			</div>
		);
	}
}

class ContentWrapper extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div>
				<Schedule schedule={this.props.schedule} teams={this.props.teams} />
				<Standings matchComponents={g_matchComponents} teams={this.props.teams} global={true} type={"OWL_Overall"} ref={(s) => {g_standingsComponent = s}}/>
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
				ReactDOM.render(<ContentWrapper schedule={resultSchedule} teams={resultTeams} />, document.getElementById("wrapper"));
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
