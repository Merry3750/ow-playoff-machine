import React from 'react';
import './styles/standings.css';

var CLINCH_FIRST = "+"
var CLINCH_BYE = "*"
var CLINCH_PLAYOFF = "^"
var CLINCH_NONE = ""

class Standings extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state={mounted: false};
	}

	componentDidMount()
	{
		this.setState({mounted: true});
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
			teams[i].competitor.matches = 0;
			teams[i].competitor.oppH2H = [];
			for(var j = 0; j < teams.length; j++)
			{
				if(i !== j)
				{
					teams[i].competitor.oppH2H[teams[j].competitor.id] = {match: 0, map: 0, magicNumber:{match: 0, map: 0}};
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

					teams[j].competitor.matches++

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


		for(var i = 0; i < teams.length; i++)
		{
			for(var j = 0; j < teams.length; j++)
			{
				if(i !== j)
				{
					teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber.match = teams[i].competitor.matches - teams[i].competitor.wins - teams[j].competitor.losses;
					var gamesRemaining = teams[i].competitor.matches - teams[i].competitor.wins - teams[i].competitor.losses
					var oppGamesRemaining = teams[j].competitor.matches - teams[j].competitor.wins - teams[j].competitor.losses
					teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber.map = (gamesRemaining + oppGamesRemaining) * 4 + teams[j].competitor.mapDiff - teams[i].competitor.mapDiff;
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

		var clinches = {first: false, bye: false, playoff: false};

		var standingPlaces = [];
		var divisions = [];
		var lastDivisionLeadSeed = 0;
		var lastWildCardSeed = this.props.teams.owl_divisions.length;
		for(var i = 0; i < teams.length; i++)
		{
			var seed = 0;
			var clinch = CLINCH_NONE;
			if (!divisions.includes(teams[i].competitor.owl_division) || this.props.type !== "OWL_Overall" )
			{
				divisions.push(teams[i].competitor.owl_division);
				seed = ++lastDivisionLeadSeed;
				if(i === 0)
				{
					clinch = CLINCH_FIRST;
					for(var j = i + 1; j < teams.length; j++)
					{
						var magicNumber = teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber
						if(magicNumber.match > 0 || (magicNumber.match === 0 && magicNumber.map >= 0))
						{
							clinch = CLINCH_NONE;
							break;
						}
					}
				}
				if (clinch === CLINCH_NONE && this.props.type === "OWL_Overall")
				{
					clinch = CLINCH_BYE;
					for(var j = i + 1; j < teams.length; j++)
					{
						var magicNumber = teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber;
						if((magicNumber.match > 0 || (magicNumber.match === 0 && magicNumber.map >= 0)) && teams[i].competitor.owl_division !== teams[j].competitor.owl_division)
						{
							clinch = CLINCH_NONE;
						}
					}
				} 
				if (clinch === CLINCH_NONE)
				{
					var numAhead = 0;
					var aheadSameDivision = false;
					for(var j = i + 1; j < teams.length; j++)
					{
						var magicNumber = teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber
						if(magicNumber.match < 0 || (magicNumber.match === 0 && magicNumber.map < 0))
						{
							numAhead++;
							if(teams[i].competitor.owl_division === teams[j].competitor.owl_division)
							{
								aheadSameDivision = true;
							}
						}
					}
					if(numAhead >= teams.length - maxSeed && aheadSameDivision)
					{
						clinch = CLINCH_PLAYOFF;
					}
				}
			}
			else
			{
				seed = ++lastWildCardSeed;

				var numAhead = 0;
				var aheadSameDivision = false;
				for(var j = i + 1; j < teams.length; j++)
				{
					var magicNumber = teams[i].competitor.oppH2H[teams[j].competitor.id].magicNumber
					if(magicNumber.match < 0 || (magicNumber.match === 0 && magicNumber.map < 0))
					{
						numAhead++;
						if(teams[i].competitor.owl_division === teams[j].competitor.owl_division)
						{
							aheadSameDivision = true;
						}
					}
				}
				if(numAhead >= teams.length - maxSeed && aheadSameDivision)
				{
					clinch = CLINCH_PLAYOFF;
				}
			}
			switch(clinch)
			{
				case CLINCH_FIRST:
					clinches.first = true;
					break;
				case CLINCH_BYE:
					clinches.bye = true;
					break;
				case CLINCH_PLAYOFF:
					clinches.playoff = true;
					break;
				default:
					break;
			}
			standingPlaces.push(<StandingPlace key={teams[i].competitor.id} team={teams[i]} seed={seed} type={this.props.type} clinch={clinch}/>);
		}

		var tableFooterText = [];
		var tableFooter = "";
		if(clinches.first)
		{
			tableFooterText.push(<span key={CLINCH_FIRST}><sup>{CLINCH_FIRST}</sup>-clinched first place</span>);
		}
		if(clinches.bye)
		{
			tableFooterText.push(<span key={CLINCH_BYE}>{CLINCH_BYE}-clinched first round bye</span>);
		}
		if(clinches.playoff)
		{
			tableFooterText.push(<span key={CLINCH_PLAYOFF}>{CLINCH_PLAYOFF}-clinched playoffs</span>);
		}

		if(tableFooterText.length > 0)
		{
			tableFooter = <tr><td className="standingsTableFooter" colSpan="4">{tableFooterText}</td></tr>;
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
					{tableFooter}
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
		
		var nameStyle = {
			fontWeight: inPlayoffs ? "bold" : "normal",	
		};

		var clinchIsPlus = this.props.clinch === "+"
		var clinchStyle = {
			verticalAlign: clinchIsPlus ? "top" : "middle",
			fontSize: clinchIsPlus ? "smaller" : ""
		};

		return (
			<tr className="standingsRow">
				<td className="standingsColumnName">
					<div>	
						<div className="image" style={imgStyle} />
						<div className="standingsColumnNameName" style={nameStyle} >{team.name}</div>
						<div className="standingsColumnNameClinch" style={clinchStyle}>{this.props.clinch}</div>
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
