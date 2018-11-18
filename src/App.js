import React, { Component } from 'react';
import './App.css';
import {AnalysisDisplayComponent} from "./components/analysis-display.component";
import {WaveGenerationComponent} from "./components/wave-generation.component";

class App extends Component {
  render() {
    return (
      <div className="App">
        <WaveGenerationComponent/>
        <AnalysisDisplayComponent/>
      </div>
    );
  }
}

export default App;
