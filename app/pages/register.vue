<template>
  <div class="w-screen h-screen bg-dark">
    <div class="flex items-center justify-center h-full">
      <div class="w-full max-w-md m-5 p-8 space-y-6 bg-dark rounded text-white">
        <h2 class="text-2xl font-bold text-center">Create Account</h2>

        <form class="space-y-4 mb-2" @submit.prevent="handleRegister">
          <div>
            <label for="username" class="text-sm font-medium">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Sung Jin-Woo"
              required
              class="w-full px-3 py-2 mt-2 border border-white/60 focus:border-white rounded"
            />
          </div>
          <div>
            <label for="email" class="text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="sung.jin-woo@gmail.com"
              required
              class="w-full px-3 py-2 mt-2 border border-white/60 focus:border-white rounded"
            />
          </div>
          <div>
            <label for="password" class="text-sm font-medium">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-3 py-2 mt-2 border border-white/60 focus:border-white rounded"
            />
          </div>
          <div>
            <label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-3 py-2 mt-2 border border-white/60 focus:border-white rounded"
            />
          </div>

          <div v-if="errorMessage" class="text-sm text-red-400">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="
              !username ||
              !email ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              loading
            "
            class="w-full px-4 py-2 font-bold text-white bg-primary hover:bg-primary-lighter rounded"
          >
            Create Account
          </button>
        </form>
        <div class="flex gap-2 justify-center text-sm">
          <p class="text-gray-400">Already have an account?</p>
          <NuxtLink to="/login" class="text-primary-lighter hover:underline">Login</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

definePageMeta({
  layout: 'unauthenticated',
});

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const loading = ref(false);
const { setCurrentUser } = useAuthUser();

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    console.error('Passwords do not match');
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'post',
      body: {
        username: username.value,
        email: email.value,
        password: password.value,
      },
    });
    const { user } = response;
    setCurrentUser(user);
    await navigateTo('/');
  } catch (error: any) {
    if (error.data?.message) {
      errorMessage.value = error.data.message;
    } else {
      errorMessage.value = 'An error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
