import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

class Competitor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      category: "",
      result: {},
      resposne: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange1 = this.handleChange1.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
    console.log(e.target.value);
  }
  handleChange1(e) {
    this.setState({ category: e.target.value });
    console.log(e.target.value);
  }
  foo = () => {
    console.log("running competitor ka foo");
    var list = [];
    for (var i = 0; i < this.state.result.urls.length; i++) {
      list.push(<Card.Text>{this.state.result.urls[i]}</Card.Text>);
    }
    return list;
  };
  foo1 = () => {
    console.log("Running foo1");
    var list1 = [];
    for (var i = 0; i < this.state.result.keywords.length; i++) {
      list1.push(<Card.Text>{this.state.result.keywords[i]}</Card.Text>);
    }
    return list1;
  };
  handleSubmit(e) {
    e.preventDefault();
    let params = {
      site: this.state.value,
      category: this.state.category
    };
    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");
    let url = "http://192.168.1.38:8000/competitors?" + query;
    console.log(url);
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(data => {
        return data.json();
      })
      .then(data => {
        this.setState({ result: data });
        this.setState({ resposne: true });
        console.log(this.state.result);
      });
    console.log("Form submitted");
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label>Enter your website URL here</Form.Label>
            <Form.Control
              placeholder="Enter complete URL"
              onChange={this.handleChange}
              value={this.state.value}
            />
          </Form.Group>

          <Form.Group controlId="exampleForm.ControlSelect1">
            <div>
              <Form.Label>Select your category below</Form.Label>
            </div>
            <select value={this.state.category} onChange={this.handleChange1}>
              <option value="select">Select</option>
              <option value="University">University</option>
              <option value="Corporate">Corporate</option>
              <option value="Medical">Medical</option>
              <option value="Telecom">Telecom</option>
              <option value="Social Media">Social Media</option>
            </select>
            <Form.Text className="text-muted">
              One platform for all your SEO solutions
            </Form.Text>
          </Form.Group>
          <Button variant="danger" type="submit" value="service2">
            GO
          </Button>
        </Form>
        {this.state.resposne && (
          <div>
            <h3>Your results below</h3>
            <Card bg="info" text="white" style={{ width: "18rem" }}>
              {/* <Card.Header>Broken Link Stats</Card.Header> */}
              <Card.Body>
                {this.foo()}
                <Card.Text>Suggested Keywords: {this.foo1()}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    );
  }
}
export default Competitor;
