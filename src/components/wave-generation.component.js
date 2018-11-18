import React, { Component } from 'react'

export class WaveGenerationComponent extends Component {
  render() {
    return (
      <div className='wave-generation-component'>
        <canvas className='wave-generation-component-canvas'>
        </canvas>
      </div>
    )
  }
}