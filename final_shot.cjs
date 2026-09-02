const puppeteer = require('puppeteer-core')
const { spawn } = require('child_process')
const http = require('http')

const CHROME_PATH = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome'
const PORT = 5182
const URL = `http://127.0.0.1:${PORT}`

function waitForServer(url, timeoutMs) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      http
        .get(url, (res) => {
          res.resume()
          resolve()
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('timeout'))
          else setTimeout(tryOnce, 300)
        })
    }
    tryOnce()
  })
}

;(async () => {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: '/home/claude/aos-mis',
    stdio: 'ignore',
  })
  try {
    await waitForServer(URL, 20000)
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1600, height: 1100 })
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector('input[placeholder="아이디를 입력하세요"]', { timeout: 15000 })
    await page.type('input[placeholder="아이디를 입력하세요"]', 'admin')
    await page.type('input[placeholder="비밀번호를 입력하세요"]', 'admin1234')
    await page.click('button[type="submit"]')
    await page.waitForSelector('text/AOS 접수 목록', { timeout: 15000 }).catch(() => {})
    await new Promise((r) => setTimeout(r, 2500))

    const chartArea = await page.$('main')
    if (chartArea) {
      await chartArea.screenshot({ path: '/home/claude/report_shots/final_check.png' })
    }

    await browser.close()
    console.log('OK')
  } finally {
    server.kill('SIGKILL')
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
