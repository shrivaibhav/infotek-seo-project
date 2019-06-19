import React, { Component } from "react";
import "./App.css";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Competitor from "./Competitor";
import BrokenLinks from "./BrokenLinks";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "Swagat Hai Aapka",
      service: "",
      service1: false,
      service2: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect1 = this.handleSelect1.bind(this);
    this.handleSelect2 = this.handleSelect2.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.setState({ value: e.target.value });
    console.log(e.target.value);
  }
  handleSelect1(e) {
    console.log(e.target.value);
    this.setState({ service: e.target.value });
    this.setState({ service2: false });
    this.setState({ service1: !this.state.service1 });
  }
  handleSelect2(e) {
    console.log(e.target.value);
    this.setState({ service: e.target.value });
    this.setState({ service1: false });
    this.setState({ service2: !this.state.service2 });
  }
  handleSubmit(e) {}
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="d-flex flex-column">
            <ButtonGroup size="lg">
              <Button
                variant="success"
                onClick={this.handleSelect1}
                value="service1"
              >
                Find Competitors
              </Button>
              <Button
                variant="warning"
                onClick={this.handleSelect2}
                value="service2"
              >
                Find Broken-Links
              </Button>
            </ButtonGroup>
          </div>
          {this.state.service1 && <Competitor />}
          {this.state.service2 && <BrokenLinks/>}
        </header>
      </div>
    );
  }
}

export default App;
