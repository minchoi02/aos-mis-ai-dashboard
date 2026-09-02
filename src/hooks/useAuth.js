import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'aos_mis_auth_session'

// 데모용 계정 (실제 서비스에서는 서버 인증으로 교체하세요)
const VALID_USERS = [
  { username: 'admin', password: 'admin1234', displayName: '관리자', role: '시스템 관리자' },
  { username: 'tvulcan', password: 'tvulcan1!', displayName: '티벌컨 담당자', role: '정비업체 관리자' },
]

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.username) return null
    return parsed
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = loadStoredSession()
    if (stored) setUser(stored)
    setChecking(false)
  }, [])

  const login = useCallback(({ username, password, remember }) => {
    return new Promise((resolve, reject) => {
      // 실제 서버 통신을 흉내내기 위한 인위적 지연
      setTimeout(
        () => {
          const found = VALID_USERS.find((u) => u.username === username && u.password === password)
          if (!found) {
            reject(new Error('아이디 또는 비밀번호가 올바르지 않습니다.'))
            return
          }
          const session = {
            username: found.username,
            displayName: found.displayName,
            role: found.role,
            loginAt: new Date().toISOString(),
          }
          setUser(session)
          if (remember) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
          resolve(session)
        },
        700 + Math.random() * 500,
      )
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { user, isAuthenticated: !!user, checking, login, logout }
}
