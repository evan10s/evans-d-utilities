import React from 'react';
import './App.css';
import {Col, Layout, Row} from "antd";
import ExtendedBolus from "./components/bolus/ExtendedBolus";
import {Footer} from "antd/lib/layout/layout";

const {Header, Content} = Layout;

function App() {
  return <>
    <Layout className="layout">
      <Header>
        <div className="logo">Evan's D Utilities</div>
      </Header>
      <Content style={{padding: "10px 0", marginLeft: "auto", marginRight: "auto"}}>
        <Row>
          <Col>
            <ExtendedBolus/>
          </Col>
        </Row>
      </Content>
      <Footer>
        Disclaimer: This is a website for people with diabetes who know what they're doing.
        There is no guarantee of accuracy or results from this website. If you use the information, calculations, or
        results
        on this website for insulin dosing, you do so at your own risk. Consider double-checking calculation results
        yourself
        using a calculator. The information, data, default values, and calculation results
        are not intended as medical advice. If you want medical advice, ask your doctor.
      </Footer>
    </Layout>
  </>
}

export default App;
