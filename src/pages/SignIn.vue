<script setup lang="ts">
import AuthCard from '@/components/AuthCard.vue'
import TextField from '@/components/TextField.vue'
import PasswordField from '@/components/PasswordField.vue'
import Checkbox from '@/components/Checkbox.vue'
import Button from '@/components/Button.vue'
import FormMessage from '@/components/FormMessage.vue'

import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login as apiLogin } from '@/services/auth-fake'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(true)

const loading = ref(false)
const errorMsg = ref('')
const emailError = ref('')
const passwordError = ref('')

function clearErrors() {
  errorMsg.value = ''
  emailError.value = ''
  passwordError.value = ''
}
function validEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v)
}

async function submit() {
  clearErrors()
  if (!validEmail(email.value)) emailError.value = 'Enter a valid email address'
  if (!password.value) passwordError.value = 'Password is required'
  if (emailError.value || passwordError.value) {
    errorMsg.value = 'Please fix the highlighted fields.'
    return
  }

  try {
    loading.value = true
    const { token, user } = await apiLogin({ email: email.value, password: password.value })
    auth.setSession(token, user)

    // TODO (remember me): se não quiser persistir entre sessões, salvar em sessionStorage.
    const to = (route.query.redirect as string) || '/collection'
    router.replace(to)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Sign-in failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 grid place-items-center p-6">
    <AuthCard title="Sign in" subtitle="Access your collection">
      <FormMessage v-if="errorMsg" type="error">{{ errorMsg }}</FormMessage>

      <form class="space-y-3" @submit.prevent="submit">
        <TextField
          id="email"
          label="Email"
          v-model="email"
          type="email"
          autocomplete="email"
          :error="emailError"
        />
        <PasswordField
          id="password"
          label="Password"
          v-model="password"
          autocomplete="current-password"
          :error="passwordError"
        />
        <Checkbox id="remember" label="Remember me" v-model="remember" />

        <Button class="w-full" type="submit" :loading="loading" :disabled="loading">
          Sign in
        </Button>
      </form>

      <p class="mt-4 text-xs text-gray-600">
        Don’t have an account?
        <RouterLink to="/signup" class="underline">Create one</RouterLink>.
      </p>
    </AuthCard>
  </div>
</template>
