import React from 'react';
import './styles/standings.css';

class Standings extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state={mounted: false};
	}

	componentDidMount()
	{
		this.state.mounted = true;
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
			standingPlaces.push(<StandingPlace key={teams[j].competitor.id} team={teams[j]} seed={seed} type={this.props.type}/>);
		}

		return (
			<table className="standingsTable">
				<tbody>
					<tr>
						<th>Team</th>
						<th className="standingsColumnData">W</th>
						<th className="standingsColumnData">L</th>
						<th className="standingsColumnData">+/-</th>
					</tr>
					{standingPlaces}
				</tbody>
			</table>
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

		var imgStyle = {
			backgroundImage: "url(" + team.secondaryPhoto + ")",
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

		var inPlayoffs = this.props.seed <= maxSeed
		var seed = inPlayoffs ? this.props.seed : "";
		
		var nameStyle = {
			fontWeight: "bold",	
		};

		return (
			<tr className="standingsRow">
				<td className="standingsColumnName">
					<div>	
						<div className="image" style={imgStyle} />
						<div className="standingsColumnNameName" style={nameStyle} >{team.name}</div>
						<div className="standingsColumnNameSeed">{seed}</div>
					</div>
				</td>
				<td className="standingsColumnData">
					<div>{team.wins}</div>
				</td>
				<td className="standingsColumnData">
					<div>{team.losses}</div>
				</td>
				<td className="standingsColumnData">
					<div>{team.mapDiff}</div>
				</td>
			</tr>
		);
	}
}

export default Standings;
