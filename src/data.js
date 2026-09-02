// 로컬 PC(웹 서버) IP / 포트 설정
export const serverConfig = {
  ip: '192.168.0.5',
  port: 5173,
  imagesPath: '/images',
}

export const getImageUrl = (fileName) =>
  `http://${serverConfig.ip}:${serverConfig.port}${serverConfig.imagesPath}/${fileName}`

export const statusMeta = {
  수신완료: { text: '수신완료', bg: 'bg-green-50', fg: 'text-green-700', dot: 'bg-green-500' },
  처리중: { text: '처리중', bg: 'bg-amber-50', fg: 'text-amber-700', dot: 'bg-amber-500' },
  처리완료: { text: '처리완료', bg: 'bg-blue-50', fg: 'text-blue-700', dot: 'bg-blue-500' },
  오류: { text: '오류', bg: 'bg-red-50', fg: 'text-red-700', dot: 'bg-red-500' },
}

export const STATUS_LIST = ['수신완료', '처리중', '처리완료', '오류']

// ---- 랜덤 목업 생성을 위한 참조 데이터 ----
export const makerModels = [
  { maker: '현대', models: ['그랜저 IG', '쏘나타 DN8', '아반떼 CN7', '투싼 NX4'] },
  { maker: '기아', models: ['K5 DL3', '스포티지 NQ5', '쏘렌토 MQ4'] },
  { maker: '쉐보레', models: ['말리부', '트레일블레이저'] },
  { maker: '르노', models: ['SM6', 'QM6'] },
]

export const shopList = [
  { code: 'SHOP001', name: '티범컨정비공장', address: '경기도 하남시 감초로 123', phone: '031-123-4567', manager: '김정비' },
  { code: 'SHOP002', name: '대한정비센터', address: '서울특별시 강동구 성내로 45', phone: '02-456-7890', manager: '이수리' },
  { code: 'SHOP003', name: '제일자동차공업사', address: '경기도 성남시 분당구 판교로 12', phone: '031-789-1234', manager: '박카센' },
  { code: 'SHOP004', name: '스마드정비', address: '인천광역시 남동구 인주대로 88', phone: '032-321-6547', manager: '최정비' },
  { code: 'SHOP005', name: '정직한정비소', address: '경기도 수원시 팔달구 매산로 7', phone: '031-654-3210', manager: '정성실' },
]

export const carColors = ['검정색', '흰색', '은색', '진회색', '청색', '적색']

export const partTypeDefs = [
  {
    type: '휠',
    imageFile: 'wheel.jpg',
    oemPrefix: '5291',
    positions: ['전륜 좌측', '전륜 우측', '후륜 좌측', '후륜 우측'],
    exchangeParts: ['19인치 휠', '18인치 휠', '17인치 휠'],
  },
  {
    type: '헤드램프',
    imageFile: 'headlamp.jpg',
    oemPrefix: '9210',
    positions: ['전면 좌측', '전면 우측'],
    exchangeParts: ['LED 헤드램프(좌)', 'LED 헤드램프(우)'],
  },
]

const PLATE_CHARS = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차']

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(num, len = 2) {
  return String(num).padStart(len, '0')
}

function randomPlate() {
  return `${randomInt(10, 99)}${randomFrom(PLATE_CHARS)}${randomInt(1000, 9999)}`
}

function randomOem(prefix) {
  return `${prefix}${randomInt(10, 99)}-${randomFrom(['G', 'H', 'K', 'M'])}${randomInt(1000, 9999)}`
}

function fmtTime(date) {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

function addSeconds(date, sec) {
  return new Date(date.getTime() + sec * 1000)
}

let seqCounter = 0

export function resetSequence(start = 0) {
  seqCounter = start
}

/**
 * 새 접수 1건을 생성합니다.
 */
export function createReceipt(receivedAt, status = '수신완료') {
  seqCounter += 1
  const id = `AOS${receivedAt.getFullYear()}${pad(receivedAt.getMonth() + 1)}${pad(
    receivedAt.getDate(),
  )}${pad(seqCounter, 4)}`

  const makerEntry = randomFrom(makerModels)
  const model = randomFrom(makerEntry.models)
  const partDef = randomFrom(partTypeDefs)
  const exchangePart = randomFrom(partDef.exchangeParts)
  const shop = randomFrom(shopList)
  const linkedAt = addSeconds(receivedAt, randomInt(20, 90))

  return {
    id,
    status,
    receivedAt,
    linkedAt,
    receivedAtLabel: fmtTime(receivedAt),
    linkedAtLabel: fmtTime(linkedAt),
    dateKey: `${pad(receivedAt.getMonth() + 1)}/${pad(receivedAt.getDate())}`,
    vehicle: {
      carNumber: randomPlate(),
      maker: makerEntry.maker,
      model,
      color: randomFrom(carColors),
    },
    part: {
      type: partDef.type,
      exchangePart,
      oemCode: randomOem(partDef.oemPrefix),
      position: randomFrom(partDef.positions),
      qty: 1,
      imageFile: partDef.imageFile,
    },
    shop,
    history: [
      { step: 'AOS → MIS 수신', status: '성공', time: fmtTime(receivedAt) },
      { step: 'MIS 데이터 반영', status: '성공', time: fmtTime(linkedAt) },
      { step: '후속 시스템 전송', status: '대기', time: '-' },
      { step: 'AOS 최종 처리', status: '대기', time: '-' },
    ],
  }
}

const STATUS_WEIGHTS = [
  ['수신완료', 0.83],
  ['처리중', 0.08],
  ['처리완료', 0.06],
  ['오류', 0.03],
]

function weightedStatus() {
  const r = Math.random()
  let acc = 0
  for (const [status, w] of STATUS_WEIGHTS) {
    acc += w
    if (r <= acc) return status
  }
  return '수신완료'
}

/**
 * 초기 대시보드용 목업 접수 목록을 생성합니다. (오래된 순으로 반환, 번호 오름차순)
 */
export function generateInitialReceipts(count = 40, baseDate = new Date()) {
  resetSequence(0)
  const start = new Date(baseDate)
  start.setHours(8, 5, 0, 0)
  const end = new Date(baseDate)
  end.setHours(14, 25, 0, 0)
  const span = (end.getTime() - start.getTime()) / (count - 1)

  const list = []
  for (let i = 0; i < count; i += 1) {
    const t = addSeconds(start, Math.round((span * i) / 1000))
    const status = i === count - 1 ? '수신완료' : weightedStatus()
    list.push(createReceipt(t, status))
  }
  return list
}

export const dailyTrendHistory = [
  { date: '05/25', 전체: 168, 수신완료: 132, 오류: 12 },
  { date: '05/26', 전체: 152, 수신완료: 118, 오류: 9 },
  { date: '05/27', 전체: 190, 수신완료: 150, 오류: 15 },
  { date: '05/28', 전체: 176, 수신완료: 140, 오류: 8 },
  { date: '05/29', 전체: 205, 수신완료: 158, 오류: 18 },
  { date: '05/30', 전체: 198, 수신완료: 150, 오류: 14 },
]

export const BASELINE_STATS = {
  total: 1248,
  received: 1102,
  processing: 68,
  done: 52,
  error: 26,
}

export const BASELINE_PARTS = {
  휠: 776,
  헤드램프: 472,
}

export const TODAY_BASELINE = {
  전체: 224,
  수신완료: 176,
  오류: 22,
}
