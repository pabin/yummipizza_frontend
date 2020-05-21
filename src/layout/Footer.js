import React, { Component } from 'react';

import {
  Container,
  Row,
  Col
} from 'react-bootstrap';



// Footer component to render site footer
class Footer extends Component {


  render() {

    var style = {
        backgroundColor: "#F8F8F8",
        borderTop: "1px solid #E7E7E7",
        padding: "20px",
        left: "0",
        bottom: "0",
        width: "100%",
    }


    return (
      <div style={style}>
        <Container>
          <Row>
            <Col sm={3}>
              <h5>Customer Care</h5>
              <p>Phone</p>
              <p>Email</p>
              <p>Direct</p>
            </Col>
            <Col sm={3}>
              <h5>Contact</h5>
              <p>About us</p>
              <p>Contact</p>
            </Col>
            <Col sm={6}>
              <h5>Payment Methods</h5>
              <p>Ebanking</p>
              <p>Ewallet</p>
              <p>Master Cards</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}



export default Footer
