import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Habit Tracker',
    short_name: 'HabitApp',
    description: '你的終極習慣與財務追蹤神器',
    start_url: '/',
    display: 'standalone', // 🌟 呢個最重要！令個 App 全螢幕打開，無瀏覽器 UI
    background_color: '#ffffff',
    theme_color: '#3b82f6', // 藍色主題
    icons: [
      {
        src: '/icon.svg', // 🌟 直接用返頭先整嗰個 SVG
        sizes: 'any',
        type: 'image/svg+xml',
      },
      // 如果你想完美支援所有舊手機，日後可以喺 public/ 加返 png 格式
      // { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      // { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}