import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', () => {
  const isError = ref(false)
  const errorTitle = ref('')
  const errorMessage = ref('')

  function throwError(title, message) {
    if (isError.value) {
      throw new Error(
        `Unable to throw UI error, because one was already thrown: ${title} ${message}`
      )
    }
    isError.value = true
    errorTitle.value = title
    errorMessage.value = message
  }

  return { isError, errorTitle, errorMessage, throwError }
})
