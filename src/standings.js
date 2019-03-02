import React from 'react';
import './styles/standings.css';

var CLINCH_FIRST = "+"
var CLINCH_DIVISION = "*"
var CLINCH_PLAYOFF = "^"
var CLINCH_PLAYIN = "†"
var CLINCH_PLAYIN_BYE = "‡"
var CLINCH_ELIMINATED = "x"
var CLINCH_NONE = ""

var OWL_OVERALL_MAXSEED = 6;
var OWL_STAGE_MAXSEED = 8;
var PLAYIN_BYE_MAXSEED = 8;
var PLAYIN_MAXSEED = 12;

var DIVISION_SIZE = 10

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
		//console.log(this.props)
		var teams = this.props.teams.competitors;
		var matchComponents = this.props.matchComponents;
		var unplayedMatches = [];
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
			if(match.scores[0] === 0 && match.scores[1] === 0)
			{
				unplayedMatches.push(match);
			}
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
		var totalMaxSeed;
		switch(this.props.type)
		{
			case "OWL_Stage":
				maxSeed = OWL_STAGE_MAXSEED;
				totalMaxSeed = OWL_STAGE_MAXSEED;
				break;
			default:
			case "OWL_Overall":
				maxSeed = OWL_OVERALL_MAXSEED;
				totalMaxSeed = PLAYIN_MAXSEED;
				break;
		}

		var clinches = {first: false, division: false, playoff: false, playin: false, playinBye: false, eliminated: false};

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
						if(!clinchAhead(teams[i], teams[j], unplayedMatches))
						{
							clinch = CLINCH_NONE;
							break;
						}
					}
				}
				if (clinch === CLINCH_NONE && this.props.type === "OWL_Overall")
				{
					clinch = CLINCH_DIVISION;
					for(var j = i + 1; j < teams.length; j++)
					{
						if(!clinchAhead(teams[i], teams[j], unplayedMatches) && teams[i].competitor.owl_division !== teams[j].competitor.owl_division)
						{
							clinch = CLINCH_NONE;
						}
					}
				} 
				if (clinch === CLINCH_NONE)
				{
					var numAhead = 0;
					var numBehind = 0;
					var aheadSameDivision = 0;
					for(var j = 0; j < teams.length; j++)
					{
						if(i < j && clinchAhead(teams[i], teams[j], unplayedMatches))
						{

							numAhead++;
							if(teams[i].competitor.owl_division === teams[j].competitor.owl_division)
							{
								aheadSameDivision++;
							}
						}
						else if(i > j && clinchAhead(teams[j], teams[i], unplayedMatches))
						{
							numBehind++;
						}
					}

					if(numBehind >= totalMaxSeed)
					{
						clinch = CLINCH_ELIMINATED;
					}
					if(numAhead >= teams.length - PLAYIN_MAXSEED && aheadSameDivision > DIVISION_SIZE - PLAYIN_MAXSEED - 1 && this.props.type === "OWL_Overall")
					{
						clinch = CLINCH_PLAYIN;
					}
					if(numAhead >= teams.length - PLAYIN_BYE_MAXSEED && aheadSameDivision > DIVISION_SIZE - PLAYIN_BYE_MAXSEED - 1 && this.props.type === "OWL_Overall")
					{
						clinch = CLINCH_PLAYIN_BYE;
					}
					if(numAhead >= teams.length - maxSeed && aheadSameDivision > DIVISION_SIZE - maxSeed - 1)
					{
						clinch = CLINCH_PLAYOFF;
					}
				}
			}
			else
			{
				seed = ++lastWildCardSeed;

				var numAhead = 0;
				var numBehind = 0;
				var aheadSameDivision = 0;
				for(var j = 0; j < teams.length; j++)
				{
					if(j === i)
					{
						continue;
					}
					if(i < j && clinchAhead(teams[i], teams[j], unplayedMatches))
					{
						numAhead++;
						if(teams[i].competitor.owl_division === teams[j].competitor.owl_division)
						{
							aheadSameDivision++;
						}
					}
					else if(i > j && clinchAhead(teams[j], teams[i], unplayedMatches))
					{
						numBehind++;
					}
				}

				if(numBehind >= totalMaxSeed)
				{
					clinch = CLINCH_ELIMINATED;
				}
				if(numAhead >= teams.length - PLAYIN_MAXSEED && aheadSameDivision >= DIVISION_SIZE - PLAYIN_MAXSEED + 1 && this.props.type === "OWL_Overall")
				{
					clinch = CLINCH_PLAYIN;
				}
				if(numAhead >= teams.length - PLAYIN_BYE_MAXSEED && aheadSameDivision >= DIVISION_SIZE - PLAYIN_BYE_MAXSEED + 1 && this.props.type === "OWL_Overall")
				{
					clinch = CLINCH_PLAYIN_BYE;
				}
				if(numAhead >= teams.length - maxSeed && aheadSameDivision >= DIVISION_SIZE - maxSeed + 1)
				{
					clinch = CLINCH_PLAYOFF;
				}
			}
			switch(clinch)
			{
				case CLINCH_FIRST:
					clinches.first = true;
					break;
				case CLINCH_DIVISION:
					clinches.division = true;
					break;
				case CLINCH_PLAYOFF:
					clinches.playoff = true;
					break;
				case CLINCH_PLAYIN_BYE:
					clinches.playinBye = true;
					break;
				case CLINCH_PLAYIN:
					clinches.playin = true;
					break;
				case CLINCH_ELIMINATED:
					clinches.eliminated = true;
					break;
				default:
					break;
			}
			standingPlaces.push(<StandingPlace key={teams[i].competitor.id} team={teams[i]} seed={seed} type={this.props.type} clinch={clinch}/>);
		}

		var tableFooterText = [];
		var tableFooter = null;
		if(clinches.first)
		{
			tableFooterText.push(<span key={CLINCH_FIRST}><sup>{CLINCH_FIRST}</sup>-clinched first place</span>);
		}
		if(clinches.division)
		{
			tableFooterText.push(<span key={CLINCH_DIVISION}>{CLINCH_DIVISION}-clinched division</span>);
		}
		if(clinches.playoff)
		{
			tableFooterText.push(<span key={CLINCH_PLAYOFF}>{CLINCH_PLAYOFF}-clinched playoffs</span>);
		}
		if((clinches.first || clinches.division || clinches.playoff) && (clinches.playin || clinches.playinBye))
		{
			tableFooterText.push(<br key={"break1"}></br>);
		}
		if(clinches.playinBye)
		{
			tableFooterText.push(<span key={CLINCH_PLAYIN_BYE}><sup>{CLINCH_PLAYIN_BYE}</sup>-clinched playin bye or better</span>);
		}
		if(clinches.playin)
		{
			tableFooterText.push(<span key={CLINCH_PLAYIN}><sup>{CLINCH_PLAYIN}</sup>-clinched playin tournament or better</span>);
		}
		if(clinches.eliminated)
		{
			
			if(((clinches.first || clinches.division || clinches.playoff) && (clinches.playin && clinches.playinBye)) || 
				(clinches.first && clinches.division && clinches.playoff) && !(clinches.playin && clinches.playinBye))
			{
				tableFooterText.push(<br key={"break2"}></br>);
			}
			tableFooterText.push(<span key={CLINCH_ELIMINATED}><sup>{CLINCH_ELIMINATED}</sup>-eliminated from playoff contention</span>);
		}
		
		if(tableFooterText.length > 0)
		{
			tableFooter = <tr><td className="standingsTableFooter" colSpan="4">{tableFooterText}</td></tr>;
		}

		var tableHeader = <tr><td className="standingsTableHeader" colSpan="4">{this.props.title}</td></tr>;

		return (
			<table className="standingsTable">
				<thead>
					{tableHeader}
					<tr>
						<th>Team</th>
						<th className="standingsColumnData">W</th>
						<th className="standingsColumnData">L</th>
						<th className="standingsColumnData">+/-</th>
					</tr>
				</thead>
				<tbody>
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
			case "OWL_Stage":
				maxSeed = OWL_STAGE_MAXSEED;
				break;
			default:
			case "OWL_Overall":
				maxSeed = OWL_OVERALL_MAXSEED;
				break;
		}

		var inPlayoffs = this.props.seed <= maxSeed;
		var inPlayin = this.props.seed <= PLAYIN_MAXSEED && !inPlayoffs && this.props.type === "OWL_Overall";
		
		var nameStyle = {
			fontWeight: inPlayoffs || inPlayin ? "bold" : "normal",	
			fontStyle: inPlayoffs ? "italic" : "normal",	
		};

		var clinchNeedsSuperscript = this.props.clinch !== "*" && this.props.clinch !== "^";
		var clinchStyle = {
			verticalAlign: clinchNeedsSuperscript ? "top" : "middle",
			fontSize: clinchNeedsSuperscript ? "smaller" : ""
		};

		return (
			<tr className="standingsRow">
				<td className="standingsColumnName">
					<div>	
						<div className="image" style={imgStyle} />
						<div className="standingsColumnNameName" style={nameStyle}>{team.name}</div>
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

// returns true if teamA is guaranteed to be above teamB in the stantings, false otherwise
function clinchAhead(teamA, teamB, unplayedMatches)
{
	var test = false
	// Tiebreakers
	// First is total match differential
	// If no total match differential exists it goes to total map differential
	// If no total map differential exists it goes to head-to-head map differential
	// If no head-to-head map differential exists it goes to head-to-head match differential
	// If no head-to-head match differential exists it goes to a tie-breaker match
	var oppH2H = teamA.competitor.oppH2H[teamB.competitor.id]
	if(oppH2H.magicNumber.match < 0 || (oppH2H.magicNumber.match === 0 && oppH2H.magicNumber.map < 0))
	{
		return true;
	}

	// For season 2, we could just check to see if there are any unplayed matches between the teams and
	// return false if there are any but in order to future proof it I made it more complicated
	var numUnplayedMatches = 0;
	for(var i = 0; i < unplayedMatches.length; i++)
	{
		var match = unplayedMatches[i];
		if((match.competitors[0] === teamA && match.competitors[1] === teamB) || (match.competitors[0] === teamB && match.competitors[1] === teamA))
		{
			numUnplayedMatches++;
		}
	}

	// multiply by 4 because that is the maximum map differential that can be achieved in a single match
	if( (oppH2H.magicNumber.match === 0 && oppH2H.magicNumber.map === 0) &&
		(oppH2H.map - (numUnplayedMatches * 4) > 0 || (oppH2H.map - (numUnplayedMatches * 4) === 0 && oppH2H.match - numUnplayedMatches > 0)))
	{
		return true;
	}
	
	return false;
}

export default Standings;
