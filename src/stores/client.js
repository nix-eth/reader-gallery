import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const osDarkMode =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const useClientStore = defineStore('client', () => {
  const theme = useStorage('theme', '')
  if (!theme.value) {
    if (osDarkMode) {
      theme.value = 'dark'
    } else {
      theme.value = 'light'
    }
  }
  function changeTheme(themeName) {
    theme.value = themeName
  }
  return { theme, changeTheme }
})
