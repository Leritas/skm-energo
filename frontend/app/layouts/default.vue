<template>
  <div class="flex min-h-screen flex-col bg-white text-neutral-900">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
