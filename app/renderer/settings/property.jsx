import React from 'react'
import ipc from 'electron-better-ipc'
import allFields from './all-fields.jsx'

export default class Property extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      [props.property]: ipc.sendSync('get-preferences-sync', props.property)
    }

    this.bindListener()
  }

  render() {
    return allFields[this.fieldType()].call(
      this,
      this.props.property,
      this.state[this.props.property],
      this.props.schema,
      newValue => {
        this.setState({[this.props.property]: newValue})
        ipc.callMain('set-pref', {prefName: this.props.property, prefValue: newValue})
      }
    )
  }

  fieldType() {
    let {type} = this.props.schema

    if (type === 'string' && this.props.schema.color) {
      type = 'color'
    }

    return type
  }

  bindListener() {
    // this.profileManager.onDidChange(this.props.property, newValue => {
    //   if (this.state[this.props.property] !== newValue) {
    //     return this.setState({[this.props.property]: newValue})
    //   }
    // })
  }
}