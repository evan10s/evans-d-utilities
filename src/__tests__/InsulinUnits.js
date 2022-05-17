import {convertInsulinMilliunitsToUnits, convertInsulinUnitsToMilliunits} from "../util/InsulinUnitsHandler";

test('Insulin units to milliunits to units should be an identity function', () => {
    const input = 5;

    const inMilliunits = convertInsulinUnitsToMilliunits(input);
    const backToUnits = convertInsulinMilliunitsToUnits(inMilliunits);

    expect(backToUnits).toBe(input);
})

test('Insulin milliunits to units to milliunits should be an identity function', () => {
    const input = 10000;

    const inUnits = convertInsulinMilliunitsToUnits(input);
    const backToMilliunits = convertInsulinUnitsToMilliunits(inUnits);

    expect(backToMilliunits).toBe(input);
})

test('Insulin units to milliunits conversion should also accept strings', () => {
    const input = "5.62";

    expect(convertInsulinUnitsToMilliunits(input)).toBe(5620);
})

test('Insulin units to milliunits conversion', () => {
    expect(convertInsulinUnitsToMilliunits(1.23)).toBe(1230);
    expect(convertInsulinUnitsToMilliunits(1)).toBe(1000);
    expect(convertInsulinUnitsToMilliunits(0)).toBe(0);
})

