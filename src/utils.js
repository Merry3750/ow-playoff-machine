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

export {isBright};
export {areContrasting};
export {getBrightness};