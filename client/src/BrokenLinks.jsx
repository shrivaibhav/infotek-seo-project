import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { NProgress } from "@tanem/react-nprogress";
import Container from "./Container";
import Bar from "./Bar";

class BrokenLinks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      result: {
        num_broken_links: 0
      },
      response: false,
      go: false,
      progVal: Math.random(1, 10),
      progValMax: Math.random(93, 98)
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
    console.log(e.target.value);
  }
  foo = () => {
    console.log("running foo");
    var list = [];
    for (var i = 0; i < this.state.result.num_broken_links; i++) {
      list.push(<Card.Text>{this.state.result.broken_links[i]}</Card.Text>);
    }
    //this.setState({})
    return list;
  };
  handleProgBar = () => {
    var i = 0;
    while (i < 5) {
      if (this.state.response) {
        break;
      }
      // setTimeout(() => {
      //   console.log("here-" + i);
      //   this.setState({ progVal: this.state.progVal + 5 });
      // }, 3000);
      i = i + 1;
    }
  };
  handleSubmit(e) {
    e.preventDefault();
    this.setState({ response: false, go: true, progVal: Math.random(1, 2) });
    let params = {
      site: this.state.value
    };
    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");
    let url = "http://127.0.0.1:8000/brokenlinks?" + query;
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
        this.setState({
          result: data,
          response: true,
          progVal: 100
        });
        console.log(this.state.result);
      });
    console.log("Form submitted");
    var i = 0;
    while (i < 10) {
      setTimeout(() => {
        this.setState({ progVal: this.state.progVal + Math.random(1, 2) });
      }, 500);
      i = i + 1;
    }
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Enter your website URL here</Form.Label>
            <Form.Control
              placeholder="Enter complete URL"
              onChange={this.handleChange}
              value={this.state.value}
            />
            <Form.Text className="text-muted">
              One platform for all your SEO solutions
            </Form.Text>
          </Form.Group>
          <Button variant="danger" type="submit" value="service2">
            GO
          </Button>
        </Form>
        {this.state.go && (
          <div>
            <NProgress
              animationDuration={800}
              incrementDuration={800}
              isAnimating={!this.state.response}
              minimum={0}
            >
              {({ animationDuration, isFinished, progress }) => (
                <Container
                  animationDuration={animationDuration}
                  isFinished={isFinished}
                >
                  <Bar
                    animationDuration={animationDuration}
                    progress={progress}
                  />
                </Container>
              )}
            </NProgress>
          </div>
        )}
        {this.state.response && (
          <div>
            <h3>Your results below</h3>
            <Card bg="info" text="white" style={{ width: "18rem" }}>
              {/* <Card.Header>Broken Link Stats</Card.Header> */}
              <Card.Body>
                {this.state.response && <Card.Text>Broken Links:</Card.Text>}
                {this.state.response && this.foo()}
                <Card.Text>
                  No. of active links: {this.state.result.num_active_links}
                </Card.Text>
                <Card.Text>
                  No. of broken links: {this.state.result.num_broken_links}
                </Card.Text>
                <Card.Text>
                  No. of redirect links: {this.state.result.num_redirect_links}
                </Card.Text>
                <Card.Text>
                  Total number of links: {this.state.result.num_total_links}
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    );
  }
}
export default BrokenLinks;
