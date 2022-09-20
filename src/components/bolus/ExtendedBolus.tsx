import React, {useState} from 'react';
import {Alert, Col, Form, InputGroup, Row} from "react-bootstrap";
import {convertInsulinMilliunitsToUnits, convertInsulinUnitsToMilliunits} from "../../util/InsulinUnitsHandler";

type Bolus = {
	extended: boolean
	duration_mins: number
	totalUnits_mu: number
	nowPercent: number
}

function hoursFromDuration(duration: number): number {
	return Math.floor(duration);
}

function minutesFromDuration(duration: number): number {
	const fractionalMins = duration - hoursFromDuration(duration)
	return Math.round(fractionalMins * 60)
}

function calculateBoluses(carbs: number, carbsPerHour: number, totalInsulin_mu: BolusComponents): Bolus[] {
	if (carbs === 0 ||
		carbsPerHour === 0) {
		return [];
	}

	const totalDuration_mins = Math.round(carbs / carbsPerHour * 60);
	console.log(`Total duration is ${totalDuration_mins}`)

	const MAX_BOLUS_LENGTH_MINS = 120;
	const numBolusesRequired = Math.ceil(totalDuration_mins / MAX_BOLUS_LENGTH_MINS);
	console.log(`Num boluses req: ${numBolusesRequired}`)

	const result: Bolus[] = [];

	const remainingInsulin = {...totalInsulin_mu}
	console.log("Remaining insulin", remainingInsulin)

	// Subtract IOB from correction dose
	remainingInsulin.correction = Math.max(0, remainingInsulin.correction - remainingInsulin.on_board)

	let remainingDuration = totalDuration_mins;
	let totalExtendedUnits_mu = 0;
	for (let i = 0; i < numBolusesRequired; i++) {
		console.log("-------New bolus------")
		const isFirstBolus = i === 0;
		console.log(`isFirstBolus: ${isFirstBolus}`)
		const duration_mins = Math.min(120, remainingDuration);
		console.log(`Duration: ${duration_mins} mins`)
		const bolus: Bolus = {
			extended: true,
			duration_mins,
			totalUnits_mu: 0,
			nowPercent: 0,
		}
		console.log(`og bolus`, bolus)
		remainingDuration -= duration_mins;
		console.log(`rem duration: ${remainingDuration}`)
		const thisBolusDurationPercentageOfWhole = duration_mins / totalDuration_mins;
		console.log(`thisBolusDurationPercentageOfWhole: ${thisBolusDurationPercentageOfWhole}`)
		let thisBolusNowPercentWithoutCorrection = 0;
		let thisBolusNowAmt_mu = 0;

		if (isFirstBolus) {
			console.log("First bolus")
			thisBolusNowPercentWithoutCorrection = carbsPerHour / carbs;

			thisBolusNowAmt_mu = thisBolusNowPercentWithoutCorrection * remainingInsulin.carbs
			console.log(`thisBolusNowAmt_mu`, thisBolusNowAmt_mu)

			totalExtendedUnits_mu = remainingInsulin.carbs - thisBolusNowAmt_mu
		}

		console.log("totalExtended:", totalExtendedUnits_mu)
		const thisBolusInsulinLaterForCarbs_mu = totalExtendedUnits_mu * thisBolusDurationPercentageOfWhole

		thisBolusNowAmt_mu += remainingInsulin.correction;
		remainingInsulin.correction = 0;

		bolus.totalUnits_mu = thisBolusNowAmt_mu + thisBolusInsulinLaterForCarbs_mu;
		bolus.nowPercent = thisBolusNowAmt_mu / bolus.totalUnits_mu

		result.push(bolus);
	}

	return result;
}

function BolusCard(bolus: Bolus, idx: number) {
	const duration_hrs = bolus.duration_mins / 60;
	return <div>
		<p><strong>{bolus.extended && "Extended"} Bolus #{idx + 1}</strong></p>
		<ul>
			<li>Total insulin: {convertInsulinMilliunitsToUnits(bolus.totalUnits_mu).toFixed(2)} u</li>
			{bolus.extended && <li>Extended</li>}
			<li>Now percent: {(bolus.nowPercent * 100).toFixed(0)}%</li>
			<li>Duration (mins): {hoursFromDuration(duration_hrs)}:{minutesFromDuration(duration_hrs)} hrs</li>
		</ul>
	</div>;
}

type BolusComponents = {
	carbs: number,
	correction: number,
	on_board: number,
}

type BolusComponentsKey = keyof BolusComponents

// function parseRawDurationToMins(text: string): number {
// 	if (text.match(/^[0-8]:\d{2}$/)) {
// 		const [hoursStr, minsStr] = text.split(":", 2)
// 		console.log(text)
// 		const hours = Number.parseInt(hoursStr)
// 		const mins = Number.parseInt(minsStr)
//
// 		if (mins > 59 ||
// 			(hours === 8 && mins > 0)) {
// 			return 0
// 		}
//
// 		return hours * 60 + mins
// 	}
//
// 	return 0
// }

function calculateTotalInsulin(totalInsulin: BolusComponents): number {
	let total = 0;

	totalInsulin.correction = Math.max(0, totalInsulin.correction - totalInsulin.on_board)
	totalInsulin.on_board = 0

	for (const totalInsulinKey in totalInsulin) {
		const key = totalInsulinKey as BolusComponentsKey;
		total += totalInsulin[key];
	}

	return total;
}

function ExtendedBolus() {
	const [totalInsulinInputs, setTotalInsulinInputs] = useState<BolusComponents>({
		carbs: 0,
		correction: 0,
		on_board: 0,
	})
	const [totalInsulin_mu, setTotalInsulin_mu] = useState<BolusComponents>({
		carbs: 0,
		correction: 0,
		on_board: 0,
	})
	const [carbs, setCarbs] = useState<number>(0)
	// const [carbRatio, setCarbRatio] = useState<number>(0)
	const [carbsPerHour, setCarbsPerHour] = useState<number>(0)

	// const [totalDurationRaw, setRawTotalDuration] = useState<string>("")


	function updateTotalInsulin(type: BolusComponentsKey, amount: string | number) {
		if (typeof amount === "string") {
			amount = Number.parseFloat(amount)
		}

		if (amount < 0) {
			amount = 0
		}

		setTotalInsulinInputs({
			...totalInsulinInputs,
			[type]: amount
		})

		setTotalInsulin_mu({
			...totalInsulin_mu,
			[type]: convertInsulinUnitsToMilliunits(amount)
		})
	}

	const boluses = calculateBoluses(carbs, carbsPerHour, totalInsulin_mu)
	return (
		<>
			<h1>Extended bolus calculator</h1>
			<Alert variant="danger"><small><strong>Disclaimer: </strong>
				<strong><em>This is not medical advice!</em></strong> This website contains very specific, opionated
				diabetes-related calculators made for Evan to solve
				common issues he encounters. If you are not Evan, it likely won't suit your needs, and using it is
				not recommended. There is no guarantee of accuracy or results. Even if you use this calculator, you are
				ultimately
				responsible for the actions you take. Ask medical questions to your doctor.
			</small></Alert>
			<h2>Dose parameters</h2>
			<p>What are your current values for:</p>
			<Form>
				{/*<Form.Group as={Row} className="mb-3" controlId="setting.carb_ratio">*/}
				{/*	<Form.Label column xs={6} sm={6}>*/}
				{/*		I:C ratio*/}
				{/*	</Form.Label>*/}
				{/*	<Col xs={6} sm={6}>*/}
				{/*		<InputGroup>*/}
				{/*			<InputGroup.Text>1u : </InputGroup.Text>*/}
				{/*			<Form.Control type="number" min={0} max={999} value={carbRatio || ""}*/}
				{/*			              onChange={(event) => setCarbRatio(Number.parseFloat(event.target.value))}/>*/}
				{/*			<InputGroup.Text>g</InputGroup.Text>*/}
				{/*		</InputGroup>*/}
				{/*	</Col>*/}
				{/*</Form.Group>*/}
				<Form.Group as={Row} className="mb-3" controlId="setting.carbs_per_hour">
					<Form.Label column xs={6} sm={6}>
						Carbs absorbed per hour
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={999} value={carbsPerHour || ""}
							              onChange={(event) => setCarbsPerHour(Number.parseFloat(event.target.value))}/>
							<InputGroup.Text>g/hr</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>
			</Form>


			<h2>Bolus information</h2>

			<p>Start by entering a regular bolus into the pump. View calculation details and enter the following
				information:</p>

			<Alert variant="info">
				<strong>Note:</strong> Enter <strong>positive</strong> numbers for all values!
			</Alert>

			<Alert variant="warning"><strong>Warning:</strong> Use 3 or fewer decimal places.</Alert>

			<Alert variant="warning"><strong>Warning:</strong> Pay attention to the units!!
				1000 <strong><em>m</em>u</strong> (milliunits) = 1
				u (unit).
				This may produce minor rounding errors, but overall avoids other problems with float representation in
				Javascript.
				Any number in milliunits must be converted back to units before being used for dosing insulin with an
				insulin pump.
			</Alert>

			<Form>
				<Form.Group as={Row} className="mb-3" controlId="carbs">
					<Form.Label column xs={6} sm={6}>
						Number of carbs <br/>
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={99} value={carbs || ""}
							              onChange={(event) => setCarbs(Number.parseInt(event.target.value))}/>
							<InputGroup.Text>g</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>

				<Form.Group as={Row} className="mb-3" controlId="insulin.correction">
					<Form.Label column xs={6} sm={6}>
						Insulin for correction <br/>
						<small>Stored: {totalInsulin_mu.correction} mu</small>
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={25} value={totalInsulinInputs.correction || ""}
							              onChange={(event) => updateTotalInsulin("correction", event.target.value)}/>
							<InputGroup.Text>u</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>

				<Form.Group as={Row} className="mb-3" controlId="insulin.carbs">
					<Form.Label column xs={6} sm={6}>
						Insulin for carbs <br/>
						<small>Stored: {totalInsulin_mu.carbs} mu</small>
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={25} value={totalInsulinInputs.carbs || ""}
							              onChange={(event) => updateTotalInsulin("carbs", event.target.value)}/>
							<InputGroup.Text>u</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>

				<Form.Group as={Row} className="mb-3" controlId="insulin.on_board">
					<Form.Label column xs={6} sm={6}>
						Insulin on board <br/>
						<small>Stored: {totalInsulin_mu.on_board} mu</small>
					</Form.Label>
					<Col xs={6} sm={6}>
						<InputGroup>
							<Form.Control type="number" min={0} max={100} value={totalInsulinInputs.on_board || ""}
							              onChange={(event) => updateTotalInsulin("on_board", event.target.value)}/>
							<InputGroup.Text>u</InputGroup.Text>
						</InputGroup>
					</Col>
				</Form.Group>
				<p>
					<strong>Total
						insulin:</strong> {convertInsulinMilliunitsToUnits(calculateTotalInsulin(totalInsulin_mu)).toFixed(2)} u <br/>
					<small>Raw: {calculateTotalInsulin(totalInsulin_mu)} mu</small>
				</p>
			</Form>

			{/*<h2>Extension parameters</h2>*/}
			{/*<Form>*/}
			{/*	<Form.Group as={Row} className="mb-3" controlId="total_duration">*/}
			{/*		<Form.Label column xs={6} sm={6}>*/}
			{/*			Total desired extension length (h:mm) <em>(max 8:00 hrs)</em><br/>*/}
			{/*			<small>Stored: {parseRawDurationToMins(totalDurationRaw)} mins</small>*/}
			{/*		</Form.Label>*/}
			{/*		<Col xs={6} sm={6}>*/}
			{/*			<InputGroup>*/}
			{/*				<Form.Control type="text" value={totalDurationRaw || ""} maxLength={4}*/}
			{/*				              onChange={(event) => setRawTotalDuration(event.target.value)}/>*/}
			{/*				<InputGroup.Text>hrs</InputGroup.Text>*/}
			{/*			</InputGroup>*/}
			{/*		</Col>*/}
			{/*	</Form.Group>*/}
			{/*</Form>*/}


			<h2>Results</h2>
			<div>
				{!boluses.length && <p>Based on your inputs, no boluses are required.</p>}
				{boluses.map((bolus, idx) =>
					BolusCard(bolus, idx)
				)}
				<br/>
				<strong>Estimated total insulin</strong> (should match above): {
				convertInsulinMilliunitsToUnits(boluses.reduce((prev, curr) => {
					return +(prev + curr.totalUnits_mu).toFixed(3)
				}, 0)).toFixed(2)
			}&nbsp;u

			</div>
		</>);
}

export default ExtendedBolus;
