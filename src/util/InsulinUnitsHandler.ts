const INPUT_UNITS_TO_MILLIUNITS_CONVERSION = 1000; // units * 1000 = milliunits
const OUTPUT_MILLIUNITS_TO_UNITS_CONVERSION = .001 // milliunits / 1000 = milliunits * .001 = units

export function convertInsulinUnitsToMilliunits(input: string | number): number {
	let parsed;
	if (typeof input === "string") {
		parsed = Number.parseFloat(input);
	} else {
		parsed = input;
	}

	if (parsed < 0) {
		throw new RangeError(`Parsed input value ${parsed} is negative, but must be greater than or equal to zero.`);
	}

	if (parsed > 0 && parsed < 0.01) {
		throw new RangeError(`Parsed input value ${parsed} u is extremely tiny. Perhaps you made a conversion error somewhere?`)
	}

	if (parsed > 60) {
		throw new RangeError(`Parsed input value ${parsed} u is a very large number of units of insulin. This is abnormal and very likely to be unsafe. Perhaps you passed in milliunits of insulin?`)
	}

	return Math.round(parsed * INPUT_UNITS_TO_MILLIUNITS_CONVERSION);
}

export function convertInsulinMilliunitsToUnits(input: number): number {
	if (input < 0) {
		throw new RangeError(`Input value ${input} mu is negative, but must be greater than or equal to zero.`);
	}

	if (input > 0 && input < 10) {
		throw new RangeError(`Input value ${input} mu corresponds to less than 0.01 u of insulin. Perhaps you passed in units of insulin?`)
	}

	if (input > 60 * INPUT_UNITS_TO_MILLIUNITS_CONVERSION) {
		throw new RangeError(`Input value ${input} mu corresponds to more than 60 u of insulin. This is abnormal and very likely to be unsafe.`)
	}

	return input * OUTPUT_MILLIUNITS_TO_UNITS_CONVERSION;
}
