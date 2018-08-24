import React from 'react';

class Standings extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		var teams = this.props.teams.competitors;
		var matchComponents = this.props.matchComponents;
		for(var i = 0; i < teams.length; i++)
		{
			teams[i].competitor.wins = 0;
			teams[i].competitor.losses = 0;
			teams[i].competitor.mapDiff = 0;
			teams[i].competitor.oppH2H = [];
			for(var j = 0; j < teams.length; j++)
			{
				if(i !== j)
				{
					teams[i].competitor.oppH2H[teams[j].competitor.id] = {match: 0, map: 0};
				}
			}
		}

		for(var i = 0; i < matchComponents.length; i++)
		{
			var match = matchComponents[i].props.match;
			for (var j = 0; j < teams.length; j++)
			{
				if(match.competitors[0].id === teams[j].competitor.id || match.competitors[1].id === teams[j].competitor.id)
				{
					var index = (match.competitors[0].id === teams[j].competitor.id ? 0 : 1);
					var otherIndex = 1 - index;

					var oppId = match.competitors[otherIndex].id
					
					if(match.scores[index].value > match.scores[otherIndex].value)
					{
						teams[j].competitor.wins++;
						teams[j].competitor.oppH2H[oppId].match++;
					}
					else if (match.scores[index].value < match.scores[otherIndex].value)
					{
						teams[j].competitor.losses++;
						teams[j].competitor.oppH2H[oppId].match--;
					}

					var mapDiff = match.scores[index].value - match.scores[otherIndex].value;
					teams[j].competitor.mapDiff += mapDiff;
					teams[j].competitor.oppH2H[oppId].map += mapDiff;
				}
			}
		}

		teams.sort(function(a,b)
		{
			if(a.competitor.wins !== b.competitor.wins)
			{
				return b.competitor.wins - a.competitor.wins;
			}
			else if(a.competitor.mapDiff !== b.competitor.mapDiff)
			{
				return b.competitor.mapDiff - a.competitor.mapDiff;
			}
			else if(b.competitor.oppH2H[a.competitor.id].match !== 0)
			{
				return b.competitor.oppH2H[a.competitor.id].match;
			}
			else if(b.competitor.oppH2H[a.competitor.id].map !== 0)
			{
				return b.competitor.oppH2H[a.competitor.id].map;
			}
			else
			{
				return Math.random() - 0.5;
			}
		});

		var standingPlaces = [];
		var divisions = [];
		var lastDivisionLeadSeed = 0;
		var lastWildCardSeed = this.props.teams.owl_divisions.length;
		for(var j = 0; j < teams.length; j++)
		{
			var seed = 0;
			if (!divisions.includes(teams[j].competitor.owl_division) || this.props.type !== "OWL_Overall")
			{
				divisions.push(teams[j].competitor.owl_division);
				seed = ++lastDivisionLeadSeed;
			}
			else
			{
				seed = ++lastWildCardSeed;
			}
			var isTop = (j === 0);
			standingPlaces.push(<StandingPlace key={teams[j].competitor.id} team={teams[j]} isTop={isTop} seed={seed} type={this.props.type}/>);
		}

		var divStyle = {
			marginTop: "5px",
			maxWidth: "500px",
			//verticalAlign: "middle",
			display: "inline-block",
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
		team.mapDiff = (team.mapDiff > 0 ? "+" + team.mapDiff : team.mapDiff);

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
		var textStyle2 = {
			color: "black",
			fontSize: "12px",
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

		var maxSeed;
		switch(this.props.type)
		{
			case "OWL_StageA":
				maxSeed = 3;
				break;
			case "OWL_StageB":
				maxSeed = 4;
				break;
			default:
			case "OWL_Overall":
				maxSeed = 6;
				break;
		}

		return (
			<div style={wrapperStyle}>
				<div style={imgStyle} />
				<div style={textStyle}>{team.name}</div>
				<div style={textStyle2}>{this.props.seed <= maxSeed ? this.props.seed : ""}</div>
				<div style={scoreWrapperStyle}>
					<div style={scoreStyle}>{team.wins}</div>
					<div style={scoreStyle}>{team.losses}</div>
					<div style={scoreStyle}>{team.mapDiff}</div>
				</div>
			</div>
		);
	}
}

export default Standings;