<script setup lang="ts">
import AuthCard from '@/components/AuthCard.vue'
import TextField from '@/components/TextField.vue'
import PasswordField from '@/components/PasswordField.vue'
import Checkbox from '@/components/Checkbox.vue'
import Button from '@/components/Button.vue'
import FormMessage from '@/components/FormMessage.vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register as apiRegister } from '@/services/auth-fake'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const remember = ref(true)

const loading = ref(false)
const errorMsg = ref('')

// erros por campo
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

function clearErrors() {
  errorMsg.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmError.value = ''
}

function validEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v)
}

async function submit() {
  clearErrors()

  // validação mínima
  if (!name.value.trim()) nameError.value = 'Name is required'
  if (!validEmail(email.value)) emailError.value = 'Enter a valid email address'
  if (password.value.length < 8) passwordError.value = 'Password must be at least 8 characters'
  if (confirmPassword.value !== password.value) confirmError.value = 'Passwords do not match'

  if (nameError.value || emailError.value || passwordError.value || confirmError.value) {
    errorMsg.value = 'Please fix the highlighted fields.'
    return
  }

  try {
    loading.value = true
    const { token, user } = await apiRegister({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    auth.setSession(token, user)

    // TODO (remember me): se não quiser persistir entre sessões, mover sessão para sessionStorage.
    router.push('/collection')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 grid place-items-center p-6">
    <AuthCard title="Sign Up" subtitle="Access your collection">
      <FormMessage v-if="errorMsg" type="error">{{ errorMsg }}</FormMessage>

      <form class="space-y-3" @submit.prevent="submit">
        <TextField
          id="name"
          label="Name"
          v-model="name"
          autocomplete="name"
          required
          :error="nameError"
        />

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
          :error="passwordError"
          hint="At least 8 characters"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm Password"
          v-model="confirmPassword"
          :error="confirmError"
        />

        <Checkbox id="remember" label="Remember me" v-model="remember" />

        <Button class="w-full" type="submit" :loading="loading" :disabled="loading">
          Sign Up
        </Button>
      </form>

      <p class="mt-4 text-xs text-gray-600">
        Already have an account?
        <RouterLink to="/signin" class="underline">Sign in</RouterLink>.
      </p>
    </AuthCard>
  </div>
</template>
