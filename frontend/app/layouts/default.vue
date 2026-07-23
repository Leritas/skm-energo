<template>
  <div class="flex min-h-screen flex-col bg-white text-neutral-900">
    <SkmHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SkmFooter />
  </div>
</template>
