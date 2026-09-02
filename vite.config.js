import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 - 같은 네트워크(192.168.0.5)의 다른 PC에서도 접속 가능
    port: 5173,
  },
})
