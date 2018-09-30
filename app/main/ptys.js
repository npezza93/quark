const {api} = require('electron-util')
const ipc = require('electron-better-ipc')

const {pref} = require('../configuration/config-file')
const Pty = require('./pty')
const TitleTracker = require('./title-tracker')

module.exports = () => {
  const sessions = {}

  const kill = id => {
    sessions[id].kill()
    delete sessions[id]
  }

  const create = () => {
    return new Promise(resolve => {
      const newPty = new Pty(pref())
      const titleTracker = new TitleTracker(newPty)

      resolve({pty: newPty, titleTracker})
    })
  }
  let preppedPty = create()

  ipc.answerRenderer('create-pty', async () => {
    const {pty, titleTracker} = await preppedPty

    pty.onExit(() => kill(pty.id))
    sessions[pty.id] = pty
    preppedPty = create()
    titleTracker.dispose()

    return {id: pty.id, title: titleTracker.title}
  })
  ipc.answerRenderer('kill-pty', kill)

  api.app.on('quit', () => Object.keys(sessions).forEach(kill))
}
