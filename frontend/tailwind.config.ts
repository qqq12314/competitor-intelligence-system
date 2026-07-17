import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glacier: '#EEF4FA',
        mist: '#E8F0F8',
        ink: '#171C31',
        ocean: '#1268D8',
        champagne: '#D7BB69',
        copy: '#687386',
        line: '#DDE5EF',
        oat: '#E9DFD1',
        cream: '#FFFDF8',
        espresso: '#4A3328',
        caramel: '#C58B42'
      },
      boxShadow: {
        soft: '0 26px 70px rgba(23, 28, 49, 0.10)',
        cafe: '0 24px 55px rgba(74, 51, 40, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'sans-serif'],
        script: ['STKaiti', 'KaiTi', 'FangSong', 'serif']
      }
    }
  },
  plugins: []
} satisfies Config
