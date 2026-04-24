import {Alert} from "react-bootstrap";
import React from "react";

function Disclaimer() {
    return <Alert variant="danger"><small><strong>Disclaimer: </strong>
        <strong><em>This is not medical advice!</em></strong> This website contains very specific, opionated
        diabetes-related calculators made for Evan to solve
        common issues he encounters. If you are not Evan, it likely won't suit your needs, and using it is
        not recommended. There is no guarantee of accuracy or results. Even if you use this calculator, you are
        ultimately
        responsible for the actions you take. Ask medical questions to your doctor.
    </small></Alert>
}

export default Disclaimer;