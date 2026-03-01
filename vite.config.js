import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/index.js'),
      name: 'DateTimePickerCustom',
      fileName: (format) => `date-time-picker-custom.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'date-fns'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'framer-motion': 'framerMotion',
          'lucide-react': 'lucideReact',
          'date-fns': 'dateFns'
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
  }
})
