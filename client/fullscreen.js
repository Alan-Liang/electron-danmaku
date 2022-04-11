var e = require('electron')

;(async () => {
  await e.app.whenReady()
  const size = e.screen.getPrimaryDisplay().size
  win = new e.BrowserWindow({
    alwaysOnTop: true,
    transparent: true,
    titleBarStyle: 'hidden',
    nodeIntegration: true,
    skipTaskbar: true,
    focusable: false,
    x: 0,
    y: 0,
    ...size,
  })
  win.setIgnoreMouseEvents(true)
  win.loadURL('data:text/html,<body style="margin:0;border:10px solid red"><h1>Hello World!</h1>')
})()
