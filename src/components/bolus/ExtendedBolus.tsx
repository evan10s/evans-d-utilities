import React, {useState} from 'react';
import {Col, Form, InputGroup, Row} from "react-bootstrap";

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
	return <p title={"Bolus #1"}>
		<p><strong>Duration:</strong> {bolus.hours}:{bolus.minutes} hrs</p>
	</p>;
}

type TotalInsulin = {
	carbs: number,
	correction: number
}

type TotalInsulinKey = keyof TotalInsulin


function calculateTotalInsulin(totalInsulin: TotalInsulin): number {
	let total = 0;
	for (const totalInsulinKey in totalInsulin) {
		total += totalInsulin[totalInsulinKey as TotalInsulinKey]
	}

	return total;
}

function ExtendedBolus() {
	const [totalInsulin, setTotalInsulin] = useState<TotalInsulin>({
		carbs: 0,
		correction: 0
	})
	const [carbs, setCarbs] = useState<number>(0)
	const [carbRatio, setCarbRatio] = useState<number>(0)
	const [carbsPerHour, setCarbsPerHour] = useState<number>(25)


	function updateTotalInsulin(currentTotalInsulin: TotalInsulin, type: TotalInsulinKey, amount: string | number) {
		if (typeof amount === "string") {
			amount = Number.parseFloat(amount)
		}
		setTotalInsulin({
			...currentTotalInsulin,
			[type]: amount
		})
	}

	const boluses = calculateBoluses(carbs, carbRatio, carbsPerHour)
	return (
		<>
			<h1>Extended bolus calculator</h1>
			<p><small><strong>Disclaimer:</strong> This calculator was made for Evan. If you are not Evan, then the
				results are
				not guaranteed. No medical advice is being given. Ask medical questions to your doctor.
			</small></p>
			<h2>Bolus information</h2>

			<p>Start by entering a regular bolus into the pump. View calculation details and enter the following
				information:</p>

			<Form>
				<Form.Group as={Row} className="mb-3" controlId="insulin.carbs">
					<Form.Label column xs={6} sm={6}>
						Insulin for carbs
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={25} value={totalInsulin.carbs || ""}
							              onChange={(event) => updateTotalInsulin(totalInsulin, "carbs", event.target.value)}/>
							<InputGroup.Text>u</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>

				<Form.Group as={Row} className="mb-3" controlId="insulin.carbs">
					<Form.Label column xs={6} sm={6}>
						Insulin for correction
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={25} value={totalInsulin.correction || ""}
							              onChange={(event) => updateTotalInsulin(totalInsulin, "correction", event.target.value)}/>
							<InputGroup.Text>u</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>
				<p><strong>Total insulin:</strong> {calculateTotalInsulin(totalInsulin)} u</p>
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
