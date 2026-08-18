<script setup lang="ts">
import type { AdminUserDto, RoleDto } from '@skm/specs';
import { Permission } from '@skm/specs';

const emit = defineEmits<{
  refresh: [];
}>();

const { hasPermission } = usePermissions();
const { listUsers, createUser, setUserRoles } = useUsersAdmin();
const { listRoles } = useRolesAdmin();
const toast = useToast();

const page = ref(1);
const limit = 20;
const loading = ref(false);
const users = ref<AdminUserDto[]>([]);
const total = ref(0);
const roles = ref<RoleDto[]>([]);

const createOpen = ref(false);
const rolesOpen = ref(false);
const editingUser = ref<AdminUserDto | null>(null);

const createForm = reactive({
  email: '',
  password: '',
  name: '',
  roleIds: [] as number[],
});

const selectedRoleIds = ref<number[]>([]);

const canCreate = computed(() => hasPermission(Permission.canCreateUsers));
const canManageRoles = computed(() =>
  hasPermission(Permission.canManageUserRoles),
);

const roleOptions = computed(() =>
  roles.value.map((role) => ({ label: role.name, value: role.id })),
);

async function loadRoles() {
  if (!canCreate.value && !canManageRoles.value) {
    return;
  }
  roles.value = await listRoles();
}

async function loadUsers() {
  loading.value = true;
  try {
    const response = await listUsers(page.value, limit);
    users.value = response.items;
    total.value = response.total;
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить пользователей',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  await Promise.all([loadUsers(), loadRoles()]);
  emit('refresh');
}

function openCreate() {
  createForm.email = '';
  createForm.password = '';
  createForm.name = '';
  createForm.roleIds = [];
  createOpen.value = true;
}

function openEditRoles(user: AdminUserDto) {
  editingUser.value = user;
  selectedRoleIds.value = user.roles.map((role) => role.id);
  rolesOpen.value = true;
}

async function handleCreate() {
  try {
    await createUser({
      email: createForm.email.trim(),
      password: createForm.password,
      name: createForm.name.trim(),
      roleIds: createForm.roleIds.length > 0 ? createForm.roleIds : undefined,
    });
    createOpen.value = false;
    toast.add({ title: 'Пользователь создан', color: 'success' });
    await loadUsers();
  } catch (error) {
    toast.add({
      title: 'Не удалось создать пользователя',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleSaveRoles() {
  if (!editingUser.value) {
    return;
  }
  try {
    await setUserRoles(editingUser.value.id, {
      roleIds: selectedRoleIds.value,
    });
    rolesOpen.value = false;
    toast.add({ title: 'Роли обновлены', color: 'success' });
    await loadUsers();
  } catch (error) {
    toast.add({
      title: 'Не удалось обновить роли',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

watch(page, () => {
  void loadUsers();
});

onMounted(() => {
  void refresh();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-neutral-600">Сотрудники с доступом в админку</p>
      <SkmButton v-if="canCreate" icon="i-lucide-user-plus" @click="openCreate">
        Создать пользователя
      </SkmButton>
    </div>

    <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table class="min-w-full divide-y divide-neutral-200 text-sm">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Email
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Имя
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Роли
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
          <tr v-else-if="users.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-neutral-500">
              Нет пользователей
            </td>
          </tr>
          <tr v-for="user in users" v-else :key="user.id">
            <td class="px-4 py-3 text-neutral-900">
              {{ user.email }}
            </td>
            <td class="px-4 py-3 text-neutral-900">
              {{ user.name }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <SkmBadge
                  v-for="role in user.roles"
                  :key="role.id"
                  :label="role.name"
                  tone="neutral"
                  size="sm"
                />
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <SkmButton
                v-if="canManageRoles"
                variant="ghost"
                size="sm"
                icon="i-lucide-shield"
                @click="openEditRoles(user)"
              >
                Роли
              </SkmButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > limit" class="flex justify-center pt-2">
      <SkmPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
      />
    </div>

    <SkmModal
      v-model:open="createOpen"
      title="Новый пользователь"
      description="Создание учётной записи сотрудника"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleCreate">
          <SkmFormField label="Email" required>
            <SkmInput
              v-model="createForm.email"
              type="email"
              autocomplete="off"
            />
          </SkmFormField>
          <SkmFormField label="Имя" required>
            <SkmInput v-model="createForm.name" autocomplete="off" />
          </SkmFormField>
          <SkmFormField label="Пароль" required hint="Минимум 8 символов">
            <SkmInput
              v-model="createForm.password"
              type="password"
              autocomplete="new-password"
            />
          </SkmFormField>
          <SkmFormField v-if="roleOptions.length > 0" label="Роли">
            <USelectMenu
              v-model="createForm.roleIds"
              :items="roleOptions"
              multiple
              value-key="value"
              placeholder="Выберите роли"
            />
          </SkmFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <SkmButton variant="outline" @click="createOpen = false">
            Отмена
          </SkmButton>
          <SkmButton @click="handleCreate"> Создать </SkmButton>
        </div>
      </template>
    </SkmModal>

    <SkmModal
      v-model:open="rolesOpen"
      title="Роли пользователя"
      :description="
        editingUser ? `${editingUser.name} (${editingUser.email})` : undefined
      "
    >
      <template #body>
        <USelectMenu
          v-model="selectedRoleIds"
          :items="roleOptions"
          multiple
          value-key="value"
          placeholder="Выберите роли"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <SkmButton variant="outline" @click="rolesOpen = false">
            Отмена
          </SkmButton>
          <SkmButton @click="handleSaveRoles"> Сохранить </SkmButton>
        </div>
      </template>
    </SkmModal>
  </div>
</template>
