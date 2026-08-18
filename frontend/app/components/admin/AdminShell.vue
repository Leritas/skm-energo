<template>
  <div class="flex min-h-screen flex-col bg-neutral-100">
    <AdminHeader />
    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <AdminSidebar />
      <main class="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
