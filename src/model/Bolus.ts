export type Bolus = {
    extended: boolean
    duration_mins: number
    totalUnits_mu: number
    nowPercent: number
}

export function hoursFromDuration(duration: number): number {
    return Math.floor(duration);
}

export function minutesFromDuration(duration: number): string {
    const fractionalMins = duration - hoursFromDuration(duration);
    const result = Math.round(fractionalMins * 60);

    if (result < 10) {
        return `0${result}`;
    }

    return `${result}`;
}

export type BolusComponents = {
    carbs: number,
    correction: number,
    on_board: number,
}
export type BolusComponentsKey = keyof BolusComponents

export function calculateTotalInsulin(totalInsulin: BolusComponents): number {
    return totalInsulin.carbs + Math.max(0, (totalInsulin.correction || 0) - (totalInsulin.on_board || 0));
}