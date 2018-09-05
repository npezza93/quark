const {getValueAtKeyPath, pushKeyPath} = require('key-path-helpers')

const Schema = require('./schema')
const Coercer = require('./coercer')
const ConfigFile = require('./config-file')
const ProfileManager = require('./profile-manager')

module.exports =
class Config {
  constructor() {
    this._refreshConfig(null, this.configFile.contents)
    this.configFile.onDidChange(this._refreshConfig.bind(this))
  }

  get schema() {
    if (this._schema === undefined) {
      this._schema = new Schema()
    }

    return this._schema
  }

  get configFile() {
    if (this._configFile === undefined) {
      this._configFile = new ConfigFile()
    }

    return this._configFile
  }

  get profileManager() {
    if (this._profileManager === undefined) {
      this._profileManager = new ProfileManager(this.configFile)
    }

    return this._profileManager
  }

  get(keyPath, options) {
    const schema = this.schema.getSchema(keyPath)
    if (schema === null) {
      return
    }
    const activeProfile = this.profileManager.activeProfile()

    let profileKeyPath = `profiles.${activeProfile.id}.${keyPath}`
    if (schema.platformSpecific !== null) {
      profileKeyPath = pushKeyPath(profileKeyPath, process.platform)
    }

    const currentValue = getValueAtKeyPath(this.contents, profileKeyPath)
    const defaultValue = this.schema.defaultValue(keyPath)

    const coercer = new Coercer(keyPath, currentValue, defaultValue, schema, options)
    return coercer.coerce()
  }

  set(keyPath, value) {
    const schema = this.schema.getSchema(keyPath)
    if (schema === null) {
      return
    }
    const activeProfile = this.profileManager.activeProfile()

    keyPath = `profiles.${activeProfile.id}.${keyPath}`
    if (schema.platformSpecific !== null) {
      keyPath = pushKeyPath(keyPath, process.platform)
    }

    return this.configFile.update(keyPath, value)
  }

  onDidChange(keyPath, callback, options) {
    let oldValue = this.get(keyPath)
    return this.configFile.onDidChange(() => {
      const newValue = this.get(keyPath, options)
      if (oldValue !== newValue) {
        oldValue = newValue
        return callback(newValue)
      }
    })
  }

  on(event, callback) {
    return this.configFile.emitter.on(event, callback)
  }

  _refreshConfig(error, newContents) {
    if ((error !== null) || (newContents === null)) {
      return
    }

    this.contents = newContents

    this.profileManager.validate()
  }
}
