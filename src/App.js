import React, { Component } from 'react';
import './App.css';

const nodeRequire = window.require
const fs = nodeRequire('fs')

const audioFile = 'UnCompressed2_talking_singing_TVbgnoise.wav';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      audioCtx: null
    }
  }

  componentDidMount() {
    const audioCtx = new AudioContext();
    const mediaStreamSource = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    mediaStreamSource.connect(gainNode)
    gainNode.gain.value = 1;
    gainNode.connect(audioCtx.destination)
    mediaStreamSource.start(0);

    const request = new XMLHttpRequest();
    request.open('GET', audioFile, true);
    request.responseType = 'arraybuffer'; //This asks the browser to populate the retrieved binary data in a array buffer

    request.onloadend = () => {
      audioCtx.decodeAudioData(request.response).then(() => {
        console.log('!!! BOOO')
      })
      //populate audio source from the retrieved binary data. This can be done using decodeAudioData function.
      //first parameter of decodeAudioData needs to be array buffer type. So from wherever you retrieve binary data make sure you get in form of array buffer type.
      /*audioCtx.decodeAudioData(request.response, buffer => {
        mediaStreamSource.buffer = buffer;
      }, err => {
        console.warn(err)
      });*/

      this.setState({
        audioCtx
      })
    }

    request.send();
  }

  render() {
    return (
      <div className="App">
        <canvas id = "canvasGraph" width="1000px" height="800px">
        </canvas>
      </div>
    );
  }
}

export default App;
