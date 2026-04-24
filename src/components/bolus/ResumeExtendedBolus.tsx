import React, {useState} from 'react';
import {Alert, Col, Form, InputGroup, Row} from "react-bootstrap";
import {convertInsulinMilliunitsToUnits, convertInsulinUnitsToMilliunits} from "../../util/InsulinUnitsHandler";
import Disclaimer from "../Disclaimer";

/*

Inputs
- Start time
- Original duration
- Cancel time
- Resume time
- Time of cancellation amount delivered: $amt_delivered of $total_extended

Calculate:
- End time = Start time + original duration
- Time remaining at cancellation = End time - cancel time
- Time remaining from resumption = End time - resume time
- Amount remaining = $total_extended - $amt_delivered
- Time missed = resume time - cancel time
- New percent now = time missed / time remaining at cancellation
- New duration = time remaining from resumption
- New total amount = amount remaining

 */

function ResumeExtendedBolus() {
    const [nowFinishTime, setNowFinishTime] = useState<any>(0)

    return (
        <>
            <h1>Resume cancelled extended bolus calculator</h1>
            <Disclaimer/>

            <h2>Timing information</h2>
            <Alert variant="warning"><strong>Warning:</strong> The total extended bolus duration must be less than or
                equal to 8 hours.</Alert>

            <p>Enter the following timing information for the extended bolus</p>

            {nowFinishTime}
            <Form>
                <Form.Group as={Row} className="mb-3" controlId="carbs">
                    <Form.Label column xs={6} sm={6}>
                        "Now" bolus finish time<br/>
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="time" value={nowFinishTime || ""}
                                          onChange={(event) => setNowFinishTime(event.target.value)}
                            />
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

            {/*<Form>*/}
            {/*	<Form.Group as={Row} className="mb-3" controlId="carbs">*/}
            {/*		<Form.Label column xs={6} sm={6}>*/}
            {/*			Number of carbs <br/>*/}
            {/*		</Form.Label>*/}
            {/*		<Col xs={6} sm={6}>*/}
            {/*			<InputGroup>*/}
            {/*				<Form.Control type="number" min={0} max={99} value={carbs || ""}*/}
            {/*				              onChange={(event) => setCarbs(Number.parseInt(event.target.value))}/>*/}
            {/*				<InputGroup.Text>g</InputGroup.Text>*/}
            {/*			</InputGroup>*/}
            {/*		</Col>*/}
            {/*	</Form.Group>*/}

            {/*	<Form.Group as={Row} className="mb-3" controlId="insulin.correction">*/}
            {/*		<Form.Label column xs={6} sm={6}>*/}
            {/*			Insulin for correction <br/>*/}
            {/*			<small>Stored: {totalInsulin_mu.correction} mu</small>*/}
            {/*		</Form.Label>*/}
            {/*		<Col xs={6} sm={6}>*/}
            {/*			<InputGroup>*/}
            {/*				<Form.Control type="number" min={0} max={25} value={totalInsulinInputs.correction || ""}*/}
            {/*				              onChange={(event) => updateTotalInsulin("correction", event.target.value)}/>*/}
            {/*				<InputGroup.Text>u</InputGroup.Text>*/}
            {/*			</InputGroup>*/}
            {/*		</Col>*/}
            {/*	</Form.Group>*/}

            {/*	<Form.Group as={Row} className="mb-3" controlId="insulin.carbs">*/}
            {/*		<Form.Label column xs={6} sm={6}>*/}
            {/*			Insulin for carbs <br/>*/}
            {/*			<small>Stored: {totalInsulin_mu.carbs} mu</small>*/}
            {/*		</Form.Label>*/}
            {/*		<Col xs={6} sm={6}>*/}
            {/*			<InputGroup>*/}
            {/*				<Form.Control type="number" min={0} max={25} value={totalInsulinInputs.carbs || ""}*/}
            {/*				              onChange={(event) => updateTotalInsulin("carbs", event.target.value)}/>*/}
            {/*				<InputGroup.Text>u</InputGroup.Text>*/}
            {/*			</InputGroup>*/}
            {/*		</Col>*/}
            {/*	</Form.Group>*/}

            {/*	<Form.Group as={Row} className="mb-3" controlId="insulin.on_board">*/}
            {/*		<Form.Label column xs={6} sm={6}>*/}
            {/*			Insulin on board <br/>*/}
            {/*			<small>Stored: {totalInsulin_mu.on_board} mu</small>*/}
            {/*		</Form.Label>*/}
            {/*		<Col xs={6} sm={6}>*/}
            {/*			<InputGroup>*/}
            {/*				<Form.Control type="number" min={0} max={100} value={totalInsulinInputs.on_board || ""}*/}
            {/*				              onChange={(event) => updateTotalInsulin("on_board", event.target.value)}/>*/}
            {/*				<InputGroup.Text>u</InputGroup.Text>*/}
            {/*			</InputGroup>*/}
            {/*		</Col>*/}
            {/*	</Form.Group>*/}
            {/*	<p>*/}
            {/*		<strong>Total*/}
            {/*			insulin:</strong> {convertInsulinMilliunitsToUnits(calculateTotalInsulin(totalInsulin_mu)).toFixed(2)} u <br/>*/}
            {/*		<small>Raw: {calculateTotalInsulin(totalInsulin_mu)} mu</small>*/}
            {/*	</p>*/}
            {/*</Form>*/}

            <h2>Results</h2>
            <div>

                <Alert variant="danger">Validate results before using them to dose insulin!</Alert>
            </div>
        </>);
}

export default ResumeExtendedBolus;
