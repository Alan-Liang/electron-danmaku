const { app, screen, BrowserWindow } = require('electron')
const { createInterface } = require('readline')
const { io } = require('socket.io-client')

;(async () => {
  await app.whenReady()
  const size = screen.getPrimaryDisplay().size
  const win = new BrowserWindow({
    alwaysOnTop: true,
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    skipTaskbar: true,
    focusable: false,
    x: 0,
    y: 0,
    ...size,
  })
  win.setIgnoreMouseEvents(true)
  // win.webContents.toggleDevTools()
  await win.loadFile('index.html')

  const socket = io(process.env.SOCKET_IO_LOCATION || 'wss://danmaku.altk.org/')
  socket.on('connect', () => win.webContents.send('connected'))
  socket.on('disconnect', () => {
    setTimeout(() => {
      if (!socket.connected) win.webContents.send('error')
    }, 5000)
  })
  socket.on('comment', msg => {
    if (msg.content == 'GO DIE 42') {
      win.close()
      process.exit(0)
    }
    win.webContents.send('danmaku', msg.content)
  })

  const debug = async () => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    while (true) {
      const msg = await new Promise(resolve => rl.question('> ', resolve))
      if (msg == 'GO DIE 42') {
        rl.close()
        win.close()
        return
      }
      win.webContents.send('danmaku', msg)
    }
  }
})()
