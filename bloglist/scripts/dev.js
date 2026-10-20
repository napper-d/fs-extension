// 本地开发启动器：直接 spawn node 子进程，自行处理信号与进程树清理，
// 避免在 Windows 上通过 npm.cmd 批处理导致 Ctrl+C 无法干净退出的问题。
const { spawn } = require('child_process')
const path = require('path')
const treeKill = require('tree-kill')

const ROOT = path.join(__dirname, '..')
const children = new Set()

// longRunning=true 的进程退出时会连带关闭其余进程（类似 --kill-others）
function register(child, label, { longRunning = false } = {}) {
  children.add({ child, label })
  child.on('exit', (code, signal) => {
    console.log(`\n[dev] ${label} exited (code=${code}, signal=${signal})`)
    if (longRunning && !shuttingDown) shutdown(0)
  })
  return child
}

function killAll() {
  for (const { child, label } of children) {
    if (child.pid && !child.killed) {
      console.log(`[dev] killing ${label} (pid ${child.pid})`)
      treeKill(child.pid)
    }
  }
}

let shuttingDown = false
function shutdown(code) {
  if (shuttingDown) return
  shuttingDown = true
  killAll()
  setTimeout(() => process.exit(code ?? 0), 200)
}

// ---- 后端 ----
const server = spawn('node', ['--watch', 'index.js'], {
  cwd: path.join(ROOT, 'server'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
})
register(server, 'server', { longRunning: true })

// ---- 前端：等后端就绪后再启动 vite ----
const waitOnBin = require.resolve('wait-on/bin/wait-on')
const waiter = spawn('node', [waitOnBin, 'http://localhost:3001/api/blogs'], {
  stdio: 'inherit',
})
register(waiter, 'wait-on') // wait-on 是一次性任务，退出不触发 shutdown

waiter.on('exit', (code) => {
  if (code !== 0) {
    console.error('[dev] wait-on failed, shutting down')
    shutdown(1)
    return
  }
  const client = spawn('node', ['node_modules/vite/bin/vite.js'], {
    cwd: path.join(ROOT, 'client'),
    stdio: 'inherit',
  })
  register(client, 'client', { longRunning: true })
})

// ---- 信号处理：收到 Ctrl+C / SIGTERM 时清理整棵进程树再退出 ----
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

