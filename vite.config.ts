import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/logboek/',   // pas aan als je een andere mapnaam gebruikt, of '/' als root
})
