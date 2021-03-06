import {BrowserWindow, app} from 'electron';
import {is} from 'electron-util';
import Color from 'color';
import {ipcMain as ipc} from 'electron-better-ipc';

export const argbBackground = (profileManager, property) => {
  const color = new Color(profileManager.get(property));
  const hex = color.hex().slice(1);
  let opacity = Math.round(color.alpha() * 255).toString(16);
  opacity = (opacity.length < 2) ? '0' + opacity : opacity;

  return `#${opacity}${hex}`;
};

export const makeWindow = (name, options) => {
  const newWindow = new BrowserWindow(Object.assign({
    width: 600,
    height: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    frame: is.macos,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  }, options));

  loadUrl(newWindow, name);

  app.on('before-quit', () => {
    if ((newWindow !== null) && !newWindow.isDestroyed()) {
      newWindow.removeAllListeners('close');
      newWindow.removeAllListeners('context-menu');
    }
  });

  newWindow.once('ready-to-show', () => {
    newWindow.show();
    newWindow.focus();
    ipc.callRenderer(newWindow, 'showing');
  });

  return newWindow;
};

const loadUrl = (browserWindow, anchor) => {
  browserWindow.loadURL(`file://${__dirname}/../renderer/${anchor}/index.html`);
};
