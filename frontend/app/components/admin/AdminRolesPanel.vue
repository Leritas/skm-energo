<script setup lang="ts">
import type { Permission, RoleDto } from '@skm/specs';
import { Permission as PermissionEnum } from '@skm/specs';

const ROLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const { hasPermission } = usePermissions();
const { listRoles, createRole, updateRole, deleteRole } = useRolesAdmin();
const toast = useToast();

const loading = ref(false);
const roles = ref<RoleDto[]>([]);

const formOpen = ref(false);
const deleteOpen = ref(false);
const editingRole = ref<RoleDto | null>(null);
const deletingRole = ref<RoleDto | null>(null);

const form = reactive({
  slug: '',
  name: '',
  permissions: [] as Permission[],
});

const canCreate = computed(() => hasPermission(PermissionEnum.canCreateRoles));
const canManage = computed(() => hasPermission(PermissionEnum.canManageRoles));
const isEditing = computed(() => editingRole.value !== null);

async function loadRoles() {
  loading.value = true;
  try {
    roles.value = await listRoles();
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить роли',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingRole.value = null;
  form.slug = '';
  form.name = '';
  form.permissions = [];
  formOpen.value = true;
}

function openEdit(role: RoleDto) {
  editingRole.value = role;
  form.slug = role.slug;
  form.name = role.name;
  form.permissions = [...role.permissions];
  formOpen.value = true;
}

function openDelete(role: RoleDto) {
  deletingRole.value = role;
  deleteOpen.value = true;
}

async function handleSave() {
  try {
    if (isEditing.value && editingRole.value) {
      await updateRole(editingRole.value.id, {
        name: form.name.trim(),
        permissions: form.permissions,
      });
      toast.add({ title: 'Роль обновлена', color: 'success' });
    } else {
      if (!ROLE_SLUG_PATTERN.test(form.slug.trim())) {
        toast.add({
          title: 'Некорректный slug',
          description: 'Используйте kebab-case: content-editor',
          color: 'error',
        });
        return;
      }
      await createRole({
        slug: form.slug.trim(),
        name: form.name.trim(),
        permissions: form.permissions,
      });
      toast.add({ title: 'Роль создана', color: 'success' });
    }
    formOpen.value = false;
    await loadRoles();
  } catch (error) {
    toast.add({
      title: isEditing.value
        ? 'Не удалось обновить роль'
        : 'Не удалось создать роль',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleDelete() {
  if (!deletingRole.value) {
    return;
  }
  try {
    await deleteRole(deletingRole.value.id);
    deleteOpen.value = false;
    toast.add({ title: 'Роль удалена', color: 'success' });
    await loadRoles();
  } catch (error) {
    toast.add({
      title: 'Не удалось удалить роль',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

onMounted(() => {
  void loadRoles();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-neutral-600">Роли и наборы прав доступа</p>
      <SkmButton
        v-if="canCreate"
        icon="i-lucide-shield-plus"
        @click="openCreate"
      >
        Создать роль
      </SkmButton>
    </div>

    <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table class="min-w-full divide-y divide-neutral-200 text-sm">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Slug
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Название
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Права
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200">
          <tr v-if="loading">
            <td colspan="4" class="px-4 py-8 text-center text-neutral-500">
              Загрузка…
            </td>
          </tr>
          <tr v-else-if="roles.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-neutral-500">
              Нет ролей
            </td>
          </tr>
          <tr v-for="role in roles" v-else :key="role.id">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <code class="text-neutral-900">{{ role.slug }}</code>
                <SkmBadge
                  v-if="role.isSystem"
                  label="Системная"
                  tone="accent"
                  size="sm"
                />
              </div>
            </td>
            <td class="px-4 py-3 text-neutral-900">
              {{ role.name }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ role.permissions.length }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-1">
                <SkmButton
                  v-if="canManage"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="openEdit(role)"
                >
                  Изменить
                </SkmButton>
                <SkmButton
                  v-if="canManage && !role.isSystem"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="openDelete(role)"
                >
                  Удалить
                </SkmButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SkmModal
      v-model:open="formOpen"
      :title="isEditing ? 'Редактирование роли' : 'Новая роль'"
      :description="
        isEditing
          ? editingRole?.slug
          : 'Пользовательская роль с выбранными правами'
      "
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSave">
          <SkmFormField
            v-if="!isEditing"
            label="Slug"
            required
            hint="kebab-case, например content-editor"
          >
            <SkmInput v-model="form.slug" autocomplete="off" />
          </SkmFormField>
          <SkmFormField v-else-if="editingRole?.isSystem" label="Slug">
            <SkmInput :model-value="form.slug" disabled />
          </SkmFormField>
          <SkmFormField label="Название" required>
            <SkmInput v-model="form.name" autocomplete="off" />
          </SkmFormField>
          <SkmFormField label="Права">
            <AdminPermissionChecklist v-model:permissions="form.permissions" />
          </SkmFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <SkmButton variant="outline" @click="formOpen = false">
            Отмена
          </SkmButton>
          <SkmButton @click="handleSave"> Сохранить </SkmButton>
        </div>
      </template>
    </SkmModal>

    <SkmConfirmModal
      v-model:open="deleteOpen"
      title="Удалить роль?"
      :description="
        deletingRole
          ? `Роль «${deletingRole.name}» будет удалена безвозвратно.`
          : undefined
      "
      confirm-label="Удалить"
      @confirm="handleDelete"
    />
  </div>
</template>
