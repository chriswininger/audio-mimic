import React, { Component } from 'react'
const fs = window.require('fs')

const startAtSecond = 5
const loopAtSecond = 9
const interval = 1

export class AnalysisDisplayComponent extends Component {
  componentDidMount() {
    const toArrayBuffer = (buf) => {
      const ab = new ArrayBuffer(buf.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
      }

      return ab;
    }

    //const audioFile = 'UnCompressed2_talking_singing_TVbgnoise.wav';
    const context = new AudioContext();


    const analyzer = context.createAnalyser();
    analyzer.fftSize = 2048

    const getFreq = binCount => {
      return binCount * context.sampleRate/analyzer.fftSize
    }

    const gainNode = context.createGain();
    gainNode.gain.value = 1;
    const mediaStreamSource = context.createBufferSource();
    mediaStreamSource.connect(gainNode);

    gainNode.connect(analyzer);

    gainNode.connect(context.destination);

    fs.readFile('/Users/chris/projects/audio-mimic/test.ogg', (err, data) => {
      if (err) {
        return console.warn('error reading file')
      } else {
        context.decodeAudioData(toArrayBuffer(data)).then(buffer => {
          mediaStreamSource.buffer = buffer;

          mediaStreamSource.loopStart = startAtSecond
          mediaStreamSource.loopEnd = loopAtSecond
          mediaStreamSource.loop = true

          //now play the sound.
          mediaStreamSource.start(0, startAtSecond);

          //this.drawFreqGraph(analyzer)
          console.log('!!! start sampling')
          this.sampleValues(analyzer, interval, 10000).then((samples) => {
            mediaStreamSource.stop()

            const oscillators = []
            let oscCnt = analyzer.frequencyBinCount - 1
            do {
              const osc = context.createOscillator()
              osc.type = "sine"
              osc.frequency.value = getFreq(oscCnt)
              osc.start(0)

              console.log('!!! freq: ' + osc.frequency.value)

              const gain = context.createGain()
              gain.gain.value = 0

              osc.connect(gainNode)
              gainNode.connect(context.destination)

              oscillators[oscCnt] = [osc, gainNode]
            } while (oscCnt--)

            this.playSamples(samples, oscillators, interval)
          })
        }).catch(err => {
          console.warn('could not decode audio data: ' + err)
        });
      }
    })
  }

  render() {
    return (
      <div className='analysis-display-component'>
        <canvas className='analysis-display-component-canvas'>
        </canvas>
      </div>
    )
  }

  drawFreqGraph(analyzer) {
    const bufferLength = analyzer.frequencyBinCount
    const freqArray = new Uint8Array(bufferLength)
    let p1 = null
    let p2 = null

    const canvas = document.getElementsByClassName('analysis-display-component-canvas')[0]
    const canvasHeight = canvas.height
    const canvasWidth = canvas.width
    const canvasCtx = canvas.getContext('2d')

    const objHeight = 40
    const _translateY = (y, objHeight) => canvasHeight - objHeight - y;

    console.log('!!! foo: ' + _translateY(0, objHeight))

    const _draw = () => {
      analyzer.getByteFrequencyData(freqArray)

      let currentPointArray

      if (p1 === null) {
        currentPointArray = p1 = []
      } else if (p2 === null) {
        currentPointArray = p2 = []
      } else {
        // plot the a line


        p1 = null
        p2 = null
      }

      let i = bufferLength - 1
      do {
        currentPointArray[i] = freqArray[i] / 128.0
      } while(i--)

      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      canvasCtx.fillStyle = 'rgb(250,50,50)';
      canvasCtx.fillRect(10, _translateY(0, objHeight), 20, objHeight);

      //canvasCtx.fillRect(0, 50, 40, 40);
      requestAnimationFrame(_draw)
    }

    _draw()
  }

  /*
    Returns Promise<Array[Uint8Array]>
   */
  sampleValues(analyzer, intervalMS, durationMS) {
    const bufferLength = analyzer.frequencyBinCount

    const startTime = Date.now()

    const _recordSample = initialSampleSet => {
      return new Promise((resolve, reject) => {
        if (Date.now() - startTime < durationMS) {
          // keep the recursion going
          setTimeout(() => {
            const freqArray = new Uint8Array(bufferLength)
            analyzer.getByteFrequencyData(freqArray)

            _recordSample([
              ...initialSampleSet,
              freqArray
            ]).then((resultingSampleSet) => {
              // resolve the top/beginning of chain/final results
              resolve(resultingSampleSet)
            })
          }, intervalMS)
        } else {
          const freqArray = new Uint8Array(bufferLength)
          analyzer.getByteFrequencyData(freqArray)

          // resolve the end of the recursion chain (deepest call)
          resolve([
            ...initialSampleSet,
            freqArray
          ])
        }
      })
    }

    return _recordSample([])
  }

  playSamples(samples, oscillators, interval, ndx) {
    if (ndx === null || ndx === undefined || ndx >= samples.length) {
      ndx = 0
    }

    const sample =  samples[ndx]
    sample.forEach((freqBinVal, freqBinNdx) => {
      oscillators[freqBinVal][1].gain.value = freqBinVal/128.0
    })

    setTimeout(() => {
      this.playSamples(samples, oscillators, interval, ndx + 1)
    }, interval)
  }
}