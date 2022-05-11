import React, {useState} from 'react';
import {Card, Form, InputNumber, PageHeader} from "antd";

function prettyDuration(duration: number) {
	const hoursFloor = Math.floor(duration)
	const mins = Math.round((duration - hoursFloor) * 60)

	return `${hoursFloor}:${mins} hrs`
}

type Bolus = {
	extended: boolean
	hours: number
	minutes: number
	units: number
	nowPercent: number
}

function hoursFromDuration(duration: number): number {
	return Math.floor(duration);
}

function minutesFromDuration(duration: number): number {
	const fractionalMins = duration - hoursFromDuration(duration)
	return Math.round(fractionalMins * 60)
}

function calculateBoluses(carbs: number, carbRatio: number, carbsPerHour: number): Bolus[] {
	if (carbs === 0 || carbRatio === 0 || carbsPerHour === 0) {
		return [];
	}

	let duration = carbs / carbsPerHour;
	if (duration > 4) {
		duration = 4;
	}
	let numBolusesRequired = 1;
	if (duration > 2) {
		numBolusesRequired = 2;
	}

	if (numBolusesRequired === 1) {
		return [
			{
				extended: true,
				hours: hoursFromDuration(duration),
				minutes: minutesFromDuration(duration),
				units: carbs / carbRatio,
				nowPercent: carbsPerHour / carbs
			}
		]
	}
	return [];
}

function BolusCard(bolus: Bolus) {
	return <Card title={"Bolus #1"}>
		<p><strong>Duration:</strong> {bolus.hours}:{bolus.minutes} hrs</p>
	</Card>;
}

function ExtendedBolus() {
	const [carbs, setCarbs] = useState<number>(0)
	const [carbRatio, setCarbRatio] = useState<number>(0)
	const [carbsPerHour, setCarbsPerHour] = useState<number>(25)

	const boluses = calculateBoluses(carbs, carbRatio, carbsPerHour)
	return (
		<>
			<PageHeader title={"Extended bolus calculator"}/>

			<Form name={"Extended bolus"}
			      layout={"vertical"}
			>
				<Form.Item label="Carbs">
					<InputNumber min={0} max={999} value={carbs || ""} onChange={(value) => setCarbs(value || 0)}/>
				</Form.Item>

				<Form.Item label="I:C ratio">
					<InputNumber min={0} max={999} value={carbRatio || ""}
					             onChange={(value) => setCarbRatio(value || 0)}/>
				</Form.Item>

				<Form.Item label="Carbs per hour">
					<InputNumber min={0} max={999} value={carbsPerHour} onChange={setCarbsPerHour}/>
					<p><small>The number of carbs you absorb per hour. Your diabetes may vary. Evan uses 25, so that's
						the default.</small></p>
				</Form.Item>
			</Form>
			<div>
				<h3>Results</h3>
				{!boluses.length && <p>Based on your inputs, no boluses are required.</p>}
				{boluses.map(bolus =>
					BolusCard(bolus)
				)}
			</div>
		</>);
}

export default ExtendedBolus;
