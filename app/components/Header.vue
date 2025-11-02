<template>
  <div class="w-full h-16 bg-dark flex justify-center border-b border-gray-800">
    <div class="w-[80%] h-full text-white flex items-center justify-between">
      <NuxtLink to="/" class="text-lg font-bold overflow-hidden">
        <img src="/logo.png" alt="Logo" class="h-20 inline" />
      </NuxtLink>
      <div v-if="user" class="flex items-center gap-4">
        <NuxtLink to="/profile" class="text-white font-bold hover:text-primary">
          {{ user.username }}
        </NuxtLink>
        <button title="Logout" class="flex items-center" @click="handleLogout">
          <Icon name="lucide:log-out" class="text-primary hover:text-primary-lighter w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { user, fetchCurrentUser, logout } = useAuthUser();

await fetchCurrentUser();

const handleLogout = async () => {
  await logout();
};
</script>

<style></style>
