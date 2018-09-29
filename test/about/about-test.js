/* global describe, beforeEach, afterEach, it */

const path = require('path')
const {Application} = require('spectron')
const {assert} = require('chai')
const {platform} = require('electron-util')

let electron = './node_modules/electron/dist/'

electron = platform({
  macos: electron + 'Electron.app/Contents/MacOS/Electron',
  linux: electron + 'electron',
  default: electron
})

describe('About launch', function () {
  this.timeout(10000)

  beforeEach(() => {
    this.app = new Application({
      path: electron,

      args: [path.join(__dirname, '../fixtures/about.js')]
    })
    return this.app.start()
  })

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows about window', () => {
    return this.app.client.getWindowCount().then(count => {
      assert.equal(count, 1)
    })
  })

  it('displays the current app version', () => {
    return this.app.client.waitUntilWindowLoaded().getText('#version').then(text => {
      this.app.electron.remote.app.getVersion().then(currentVersion => {
        assert.equal(text, currentVersion)
      })
    })
  })

  it('renders with no errors', () => {
    return this.app.client.getRenderProcessLogs().then(logs => {
      const filteredLogs = logs.filter(log => log.level === 'SEVERE')

      assert.isEmpty(filteredLogs, 'Exception in renderer process encountered')
    })
  })
})
