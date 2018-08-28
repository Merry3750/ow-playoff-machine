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

function parseURL(schedule)
{
	var resultString = getUrlParam("result");
	if(resultString !== undefined)
	{
		var binString = b64tob2(resultString);
		for(var i = 0; i < schedule.data.stages.length; i++)
		{
			var stage = schedule.data.stages[i];
			if(stage.slug.startsWith("stage"))
			{
				for(var j = 0; j < stage.weeks.length; j++)
				{
					var week = stage.weeks[j];
					for(var k = 0; k < week.matches.length; k++)
					{
						var match = week.matches[k];
						if(match.conclusionStrategy === "MINIMUM")
						{
							var leftScore = 0;
							var rightScore = 0;
							if(binString.length >= 4)
							{
								leftScore = binString.substring(0, 2);
								rightScore = binString.substring(2, 4);
							}
							binString = binString.substring(4, binString.length);
							match.scores[0].value = parseInt(leftScore, 2);
							match.scores[1].value = parseInt(rightScore, 2);
							if(match.scores[0].value === 1 && match.scores[1].value === 1)
							{
								match.scores[1].value = 4;
								match.scores[0].value = 0;
							}
							if(match.scores[1].value === 2 && match.scores[0].value === 2)
							{
								match.scores[1].value = 0;
								match.scores[0].value = 4;
							}
							if(match.scores[1].value === 3 && match.scores[0].value === 3)
							{
								match.scores[1].value = 0;
								match.scores[0].value = 0;
							}
						}
						week.matches[k] = match;
					}
					stage.weeks[j] = week;
				}
			}
			schedule.data.stages[i] = stage;
		}
	}
	return schedule;
}

function generateURL(matchComponents)
{
	var binString = "";
	for(var i = 0; i < matchComponents.length; i++)
	{
		var match = matchComponents[i].props.match;
		var leftScore = match.scores[0].value;
		var rightScore = match.scores[1].value;
		if(leftScore === 0 && rightScore === 4)
		{
			rightScore = 1;
			leftScore = 1;
		}
		if(rightScore === 0 && leftScore === 4)
		{
			rightScore = 2;
			leftScore = 2;
		}
		leftScore = leftScore.toString(2);
		rightScore = rightScore.toString(2);
		binString += (leftScore.length == 1 ? "0" + leftScore : leftScore);
		binString += (rightScore.length == 1 ? "0" + rightScore : rightScore);
	}

	while(binString.charAt(binString.length - 1) === "0")
	{
		binString = binString.substring(0, binString.length - 1);
	}

	return window.location.origin + "/?result=" + b2tob64(binString);
}

function getUrlVars()
{
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter)
{
    var urlparameter;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}

function b64tob2(string)
{
	var ret = ""

	var charArray = string.split('');
	for(var i = 0; i < charArray.length; i++)
	{
		for(var j = 0; j < base64Helper.length; j++)
		{
			if(charArray[i] === base64Helper[j].b64)
			{
				ret += base64Helper[j].b2;
			}
		}
	}
	return ret;
}

function b2tob64(string)
{
	var ret = ""

	
	while(string.length % 6 !== 0 || string.length % 4 !== 0)
	{
		string = string += "0";
	}

	while(string.length > 0)
	{
		var sub = string.substring(0, 6);
		string = string.substring(6, string.length);
		for(var j = 0; j < base64Helper.length; j++)
		{
			if(sub === base64Helper[j].b2)
			{
				ret += base64Helper[j].b64;
			}
		}
	}
	return ret;
}

var base64Helper = [
	{b64: "A", b2: "000000"}, // 0
	{b64: "B", b2: "000001"}, // 1
	{b64: "C", b2: "000010"}, // 2
	{b64: "D", b2: "000011"}, // 3
	{b64: "E", b2: "000100"}, // 4
	{b64: "F", b2: "000101"}, // 5
	{b64: "G", b2: "000110"}, // 6
	{b64: "H", b2: "000111"}, // 7
	{b64: "I", b2: "001000"}, // 8
	{b64: "J", b2: "001001"}, // 9
	{b64: "K", b2: "001010"}, // 10
	{b64: "L", b2: "001011"}, // 11
	{b64: "M", b2: "001100"}, // 12
	{b64: "N", b2: "001101"}, // 13
	{b64: "O", b2: "001110"}, // 14
	{b64: "P", b2: "001111"}, // 15
	{b64: "Q", b2: "010000"}, // 16
	{b64: "R", b2: "010001"}, // 17
	{b64: "S", b2: "010010"}, // 18
	{b64: "T", b2: "010011"}, // 19
	{b64: "U", b2: "010100"}, // 20
	{b64: "V", b2: "010101"}, // 21
	{b64: "W", b2: "010110"}, // 22
	{b64: "X", b2: "010111"}, // 23
	{b64: "Y", b2: "011000"}, // 24
	{b64: "Z", b2: "011001"}, // 25
	{b64: "a", b2: "011010"}, // 26
	{b64: "b", b2: "011011"}, // 27
	{b64: "c", b2: "011100"}, // 28
	{b64: "d", b2: "011101"}, // 29
	{b64: "e", b2: "011110"}, // 30
	{b64: "f", b2: "011111"}, // 31
	{b64: "g", b2: "100000"}, // 32
	{b64: "h", b2: "100001"}, // 33
	{b64: "i", b2: "100010"}, // 34
	{b64: "j", b2: "100011"}, // 35
	{b64: "k", b2: "100100"}, // 36
	{b64: "l", b2: "100101"}, // 37
	{b64: "m", b2: "100110"}, // 38
	{b64: "n", b2: "100111"}, // 39
	{b64: "o", b2: "101000"}, // 40
	{b64: "p", b2: "101001"}, // 41
	{b64: "q", b2: "101010"}, // 42
	{b64: "r", b2: "101011"}, // 43
	{b64: "s", b2: "101100"}, // 44
	{b64: "t", b2: "101101"}, // 45
	{b64: "u", b2: "101110"}, // 46
	{b64: "v", b2: "101111"}, // 47
	{b64: "w", b2: "110000"}, // 48
	{b64: "x", b2: "110001"}, // 49
	{b64: "y", b2: "110010"}, // 50
	{b64: "z", b2: "110011"}, // 51
	{b64: "0", b2: "110100"}, // 52
	{b64: "1", b2: "110101"}, // 53
	{b64: "2", b2: "110110"}, // 54
	{b64: "3", b2: "110111"}, // 55
	{b64: "4", b2: "111000"}, // 56
	{b64: "5", b2: "111001"}, // 57
	{b64: "6", b2: "111010"}, // 58
	{b64: "7", b2: "111011"}, // 59
	{b64: "8", b2: "111100"}, // 60
	{b64: "9", b2: "111101"}, // 61
	{b64: "-", b2: "111110"}, // 61
	{b64: "_", b2: "111111"}, // 63
];

export {isBright};
export {areContrasting};
export {parseURL};
export {generateURL};