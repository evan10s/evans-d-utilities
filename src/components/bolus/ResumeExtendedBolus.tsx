import {Alert, Col, Form, InputGroup, Row} from "react-bootstrap";
import Disclaimer from "../Disclaimer";
import {useState} from "react";
import {DateTime} from "luxon";
import {hoursFromDuration, minutesFromDuration} from "../../model/Bolus.ts";
import {convertInsulinMilliunitsToUnits, convertInsulinUnitsToMilliunits} from "../../util/InsulinUnitsHandler.ts";
import {BolusCard} from "./ExtendedBolus.tsx";

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

function convertToHrs(mins: number): number {
    return mins / 60;
}

function calculateResult(
    nowFinishTime: DateTime | null,
    originalDurationMins: number | null,
    cancelTime: DateTime | null,
    resumeTime: DateTime | null,
    extendedAmtDelivered_u: number,
    totalExtended_u: number
) {
    if (!nowFinishTime || !originalDurationMins || !cancelTime || !resumeTime) {
        return {error: "At least one required time field is empty/invalid"};
    }

    if (resumeTime < cancelTime) {
        return {error: "Resume time must be after cancel time"};
    }

    if (resumeTime < nowFinishTime) {
        return {error: "Resume time must be after the \"now\" bolus finish time"};
    }

    if (cancelTime < nowFinishTime) {
        return {error: "Cancel time must be after the \"now\" bolus finish time"};
    }


    if (extendedAmtDelivered_u < 0 || totalExtended_u < 0) {
        return {error: "Amounts of insulin should be positive"};
    }

    if (originalDurationMins > 8 * 60) {
        return {error: "Original extended duration is greater than 8 hours"}
    }

    if (totalExtended_u <= 0) {
        return {error: "Total extended amount must be greater than zero"}
    }

    if (totalExtended_u <= extendedAmtDelivered_u) {
        console.log("totalExtended_u", totalExtended_u)
        console.log("extendedAmtDelivered_u", extendedAmtDelivered_u)

        return {error: "The extended bolus amount delivered can't be greater than the total extended amount"}
    }

    try {
        const originalEndTime = nowFinishTime.plus({minutes: originalDurationMins});
        const timeRemainingAtCancellation = originalEndTime.diff(cancelTime, "minutes").minutes;
        const timeRemainingFromResumption = originalEndTime.diff(resumeTime, "minutes").minutes;

        const amountRemaining_mu = convertInsulinUnitsToMilliunits(totalExtended_u) - convertInsulinUnitsToMilliunits(extendedAmtDelivered_u);

        const timeMissed = resumeTime.diff(cancelTime, "minutes").minutes;
        const newPercentNow = timeMissed / timeRemainingAtCancellation;
        const newDurationMins = timeRemainingFromResumption;

        if (timeRemainingAtCancellation <= 0) {
            return {error: "Extended bolus cancellation time is after the original extended bolus end time"}
        }

        if (timeRemainingFromResumption <= 0) {
            return {error: "Extended bolus resumption is after the original extended bolus end time"}
        }

        if (timeRemainingAtCancellation < 15 || timeRemainingFromResumption < 15) {
            return {error: "Extended bolus can't be resumed because it would have less than 15 minutes remaining"}
        }

        if (amountRemaining_mu < 0) {
            return {error: "Calculated amount of insulin remaining is negative"}
        }
        const newTotalAmount_u = convertInsulinMilliunitsToUnits(amountRemaining_mu);

        if (newTotalAmount_u < .4) {
            return {error: "Extended bolus can't be resumed beacuse the amount of insulin remaining is less than 0.4 u"}
        }

        return {
            originalEndTime,
            timeRemainingAtCancellation,
            timeRemainingFromResumption,
            amountRemaining_mu,
            timeMissed,
            newPercentNow,
            newDurationMins,
            newTotalAmount_u
        }
    } catch (e: unknown) {
        return {error: `Unhandled error computing result: ${e}`}
    }
}

function ResumeExtendedBolus() {
    const [nowFinishTime, setNowFinishTime] = useState<DateTime | null>(null);
    const [originalDurationMins, setOriginalDurationMins] = useState<number | null>(null);
    const [cancelTime, setCancelTime] = useState<DateTime | null>(null);
    const [resumeTime, setResumeTime] = useState<DateTime | null>(null);
    const [extendedAmtDelivered_u, setExtendedAmtDelivered_u] = useState<number>(0);
    const [totalExtended_u, setTotalExtended_u] = useState<number>(0);

    const result = calculateResult(
        nowFinishTime,
        originalDurationMins,
        cancelTime,
        resumeTime,
        extendedAmtDelivered_u,
        totalExtended_u,
    )

    return (
        <>
            <h1>Resume cancelled extended bolus calculator</h1>
            <Disclaimer/>

            <h2>Bolus information</h2>
            <p>Enter the following timing information for the extended bolus</p>

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
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        "Now" bolus finish time<br/>
                        {nowFinishTime ? <small>Stored: {nowFinishTime.toFormat("h:mm a")}</small> : ""}
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="time" value={nowFinishTime ? nowFinishTime.toFormat("HH:mm") : ""}
                                          onChange={(event) => setNowFinishTime(DateTime.fromFormat(event.target.value, "HH:mm"))}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        Original extended duration<br/>
                        {originalDurationMins ?
                            <small>Stored: {hoursFromDuration(convertToHrs(originalDurationMins))}:{minutesFromDuration(convertToHrs(originalDurationMins))} hrs</small> : ""}
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="number" step="1" value={originalDurationMins || ""}
                                          onChange={(event) => setOriginalDurationMins(event.target.value)}
                            />
                            <InputGroup.Text>mins</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        Cancellation time<br/>
                        {cancelTime ? <small>Stored: {cancelTime.toFormat("h:mm a")}</small> : ""}
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="time" value={cancelTime ? cancelTime.toFormat("HH:mm") : ""}
                                          onChange={(event) => setCancelTime(DateTime.fromFormat(event.target.value, "HH:mm"))}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        Resume time<br/>
                        {resumeTime ? <small>Stored: {resumeTime.toFormat("h:mm a")}</small> : ""}
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="time" value={resumeTime ? resumeTime.toFormat("HH:mm") : ""}
                                          onChange={(event) => setResumeTime(DateTime.fromFormat(event.target.value, "HH:mm"))}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        Extended DELIVERED amount <br/>
                        <small>Stored: {extendedAmtDelivered_u != "" ? convertInsulinUnitsToMilliunits(extendedAmtDelivered_u, true) : 0} mu</small>
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="number" min={0} max={100} value={extendedAmtDelivered_u || ""}
                                          onChange={(event) => setExtendedAmtDelivered_u(event.target.value)}/>
                            <InputGroup.Text>u</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={6} sm={6}>
                        Extended TOTAL amount <br/>
                        <small>Stored: {totalExtended_u != "" ? convertInsulinUnitsToMilliunits(totalExtended_u, true) : 0} mu</small>
                    </Form.Label>
                    <Col xs={6} sm={6}>
                        <InputGroup>
                            <Form.Control type="number" min={0} max={100} value={totalExtended_u || ""}
                                          onChange={(event) => setTotalExtended_u(event.target.value)}/>
                            <InputGroup.Text>u</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>
            </Form>

            <h2>Results</h2>
            <div>
                {result.error ? <Alert variant="danger">{result.error}</Alert> :
                    <ul>
                        <li>Total insulin: {result.newTotalAmount_u.toFixed(2)} u</li>
                        <li>Extended</li>
                        <li>Now percent: {(result.newPercentNow * 100).toFixed(0)}%</li>
                        <li>Duration
                            (mins): {hoursFromDuration(convertToHrs(result.newDurationMins))}:{minutesFromDuration(convertToHrs(result.newDurationMins))} hrs
                        </li>
                    </ul>
                }

                <Alert variant="danger">Validate results before using them to dose insulin!</Alert>
            </div>
        </>);
}

export default ResumeExtendedBolus;
