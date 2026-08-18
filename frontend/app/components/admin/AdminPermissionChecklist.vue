<script setup lang="ts">
import { ALL_PERMISSIONS, type Permission } from '@skm/specs';
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
} from '~/constants/permission-labels';

const model = defineModel<Permission[]>('permissions', { required: true });

function isChecked(permission: Permission) {
  return model.value.includes(permission);
}

function toggle(permission: Permission, checked: boolean) {
  if (checked) {
    if (!model.value.includes(permission)) {
      model.value = [...model.value, permission];
    }
    return;
  }
  model.value = model.value.filter((entry) => entry !== permission);
}

const catalogPermissions = ALL_PERMISSIONS;
</script>

<template>
  <div class="space-y-6">
    <section
      v-for="group in PERMISSION_GROUPS"
      :key="group.label"
      class="rounded-lg border border-neutral-200 bg-white p-4"
    >
      <h3 class="mb-3 text-sm font-semibold text-neutral-900">
        {{ group.label }}
      </h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <label
          v-for="permission in group.permissions"
          :key="permission"
          class="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-neutral-50"
        >
          <UCheckbox
            :model-value="isChecked(permission)"
            @update:model-value="toggle(permission, $event === true)"
          />
          <span class="text-sm text-neutral-800">
            {{ PERMISSION_LABELS[permission] }}
            <span class="block text-xs text-neutral-500">{{ permission }}</span>
          </span>
        </label>
      </div>
    </section>

    <p class="text-xs text-neutral-500">
      Доступно {{ catalogPermissions.length }} прав из каталога @skm/specs.
      Новые права добавляются только через деплой кода.
    </p>
  </div>
</template>
