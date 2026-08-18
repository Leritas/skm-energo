<script setup lang="ts">
definePageMeta({
  adminStandalone: true,
});

useSeoMeta({
  title: 'Доступ запрещён — СКМ-Энергосервис',
});
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-neutral-100 px-4"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <AdminForbidden
        title="Доступ к админ-панели запрещён"
        description="У вашей учётной записи нет права hasAccessToAdmin. Если вы сотрудник — попросите администратора выдать доступ."
      />
    </div>
  </div>
</template>
