import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Log Pose Collection',
  description: 'Documentation for Log Pose Collection',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [
      {
        text: 'Guide',
        items: [{ text: 'Introduction', link: '/introduction' }],
      },
    ],
  },
})
