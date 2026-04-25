import './App.css';
import ExtendedBolus from "./components/bolus/ExtendedBolus";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import {HashRouter, Route, Routes} from "react-router";
import ResumeExtendedBolus from "./components/bolus/ResumeExtendedBolus";

function App() {
	return <>
		<Navbar bg="dark" variant="dark">
			<Container>
				<Navbar.Brand href="#home">Evan's D Utilities</Navbar.Brand>
				<Nav className="me-auto">
					<Nav.Link href="#home">Home</Nav.Link>
					<Nav.Link href="#legacyExtendedBolus">Legacy calculator</Nav.Link>
				</Nav>
			</Container>
		</Navbar>
		<Container>
			<Row className="justify-content-md-center">
				<Col sm={4} md={4}>
					<HashRouter>
						<Routes>
							<Route path={"legacyExtendedBolus"} element={<ExtendedBolus/>}/>
							<Route path={"*"} element={<ResumeExtendedBolus/>}/>
						</Routes>
					</HashRouter>
				</Col>
			</Row>
		</Container>
		<br/>
	</>
}

export default App;
