import Koa from 'koa'
import Router from '@koa/router'
import serve from 'koa-static'
import { Server as IoServer } from 'socket.io'
import http from 'http'
import Nedb from 'nedb-promise'

const db = new Nedb({
  filename: process.env.DATABASE || 'data',
  autoload: true,
})

const app = new Koa()
const router = new Router()
app.use(serve('static'))
app.use(router.routes()).use(router.allowedMethods())

const server = http.createServer(app.callback())
const io = new IoServer(server)
server.listen(parseInt(process.env.PORT || 8080))

const state = []

let nextId = 1

; {
  const comments = await db.find({})
  comments.sort((a, b) => a.id - b.id)
  if (comments.length > 0) nextId = comments[comments.length - 1].id + 1
  for (const { id, time, content } of comments) state[id] = { id, time, content }
}

const metadata = socket => ({
  ip: socket.handshake.headers['x-forwarded-for'] || socket.handshake.address,
})

io.on('connection', socket => {
  // socket.emit('init', state, nextId)
  socket.on('comment', async content => {
    if (typeof content !== 'string') return
    if (content.length === 0) return
    if (content.includes('yyu')) return
    const id = nextId++
    state[id] = { id, content, time: Date.now() }
    io.emit('comment', state[id])
    await db.insert({ ...state[id], ...metadata(socket) })
  })
})
