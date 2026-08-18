<script setup lang="ts">
import type { AdminManufacturerDto } from '@skm/specs';

const MANUFACTURER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

defineProps<{
  canManage: boolean;
}>();

const {
  listManufacturers,
  createManufacturer,
  updateManufacturer,
  archiveManufacturer,
  restoreManufacturer,
} = useManufacturersAdmin();
const toast = useToast();

const loading = ref(false);
const includeArchived = ref(false);
const manufacturers = ref<AdminManufacturerDto[]>([]);

const formOpen = ref(false);
const archiveOpen = ref(false);
const editingManufacturer = ref<AdminManufacturerDto | null>(null);
const archivingManufacturer = ref<AdminManufacturerDto | null>(null);

const form = reactive({
  slug: '',
  name: '',
  isPublished: false,
});

const isEditing = computed(() => editingManufacturer.value !== null);

async function loadManufacturers() {
  loading.value = true;
  try {
    manufacturers.value = await listManufacturers(includeArchived.value);
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить производителей',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingManufacturer.value = null;
  form.slug = '';
  form.name = '';
  form.isPublished = false;
  formOpen.value = true;
}

function openEdit(manufacturer: AdminManufacturerDto) {
  editingManufacturer.value = manufacturer;
  form.slug = manufacturer.slug;
  form.name = manufacturer.name;
  form.isPublished = manufacturer.isPublished;
  formOpen.value = true;
}

function openArchive(manufacturer: AdminManufacturerDto) {
  archivingManufacturer.value = manufacturer;
  archiveOpen.value = true;
}

async function handleSave() {
  try {
    if (isEditing.value && editingManufacturer.value) {
      await updateManufacturer(editingManufacturer.value.id, {
        slug: form.slug.trim(),
        name: form.name.trim(),
        isPublished: form.isPublished,
      });
      toast.add({ title: 'Производитель обновлён', color: 'success' });
    } else {
      if (!MANUFACTURER_SLUG_PATTERN.test(form.slug.trim())) {
        toast.add({
          title: 'Некорректный slug',
          description: 'Используйте kebab-case: mersen',
          color: 'error',
        });
        return;
      }
      await createManufacturer({
        slug: form.slug.trim(),
        name: form.name.trim(),
        isPublished: form.isPublished,
      });
      toast.add({ title: 'Производитель создан', color: 'success' });
    }
    formOpen.value = false;
    await loadManufacturers();
  } catch (error) {
    toast.add({
      title: isEditing.value
        ? 'Не удалось обновить производителя'
        : 'Не удалось создать производителя',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleArchive() {
  if (!archivingManufacturer.value) {
    return;
  }
  try {
    await archiveManufacturer(archivingManufacturer.value.id);
    archiveOpen.value = false;
    toast.add({ title: 'Производитель архивирован', color: 'success' });
    await loadManufacturers();
  } catch (error) {
    toast.add({
      title: 'Не удалось архивировать производителя',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleRestore(manufacturer: AdminManufacturerDto) {
  try {
    await restoreManufacturer(manufacturer.id);
    toast.add({ title: 'Производитель восстановлен', color: 'success' });
    await loadManufacturers();
  } catch (error) {
    toast.add({
      title: 'Не удалось восстановить производителя',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function togglePublished(manufacturer: AdminManufacturerDto) {
  try {
    await updateManufacturer(manufacturer.id, {
      isPublished: !manufacturer.isPublished,
    });
    toast.add({
      title: manufacturer.isPublished
        ? 'Публикация снята'
        : 'Производитель опубликован',
      color: 'success',
    });
    await loadManufacturers();
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить статус публикации',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

watch(includeArchived, () => {
  void loadManufacturers();
});

onMounted(() => {
  void loadManufacturers();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="flex items-center gap-2 text-sm text-neutral-600">
        <UCheckbox v-model="includeArchived" />
        Показать архив
      </label>
      <SkmButton v-if="canManage" icon="i-lucide-factory" @click="openCreate">
        Добавить производителя
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
              Статус
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Товары
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200">
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-500">
              Загрузка…
            </td>
          </tr>
          <tr v-else-if="manufacturers.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-500">
              Нет производителей
            </td>
          </tr>
          <tr
            v-for="manufacturer in manufacturers"
            v-else
            :key="manufacturer.id"
            :class="manufacturer.deletedAt ? 'bg-neutral-50' : undefined"
          >
            <td class="px-4 py-3">
              <code class="text-neutral-900">{{ manufacturer.slug }}</code>
            </td>
            <td class="px-4 py-3 text-neutral-900">
              {{ manufacturer.name }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <SkmBadge
                  v-if="manufacturer.deletedAt"
                  label="В архиве"
                  tone="neutral"
                  size="sm"
                />
                <SkmBadge
                  v-else-if="manufacturer.isPublished"
                  label="Опубликован"
                  tone="accent"
                  size="sm"
                />
                <SkmBadge v-else label="Черновик" tone="neutral" size="sm" />
              </div>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ manufacturer.productCount }}
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="canManage" class="flex justify-end gap-1">
                <template v-if="manufacturer.deletedAt">
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-undo-2"
                    @click="handleRestore(manufacturer)"
                  >
                    Восстановить
                  </SkmButton>
                </template>
                <template v-else>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="openEdit(manufacturer)"
                  >
                    Изменить
                  </SkmButton>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    :icon="
                      manufacturer.isPublished
                        ? 'i-lucide-eye-off'
                        : 'i-lucide-eye'
                    "
                    @click="togglePublished(manufacturer)"
                  >
                    {{ manufacturer.isPublished ? 'Снять' : 'Опубликовать' }}
                  </SkmButton>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-archive"
                    :disabled="manufacturer.productCount > 0"
                    @click="openArchive(manufacturer)"
                  >
                    Архив
                  </SkmButton>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SkmModal
      v-model:open="formOpen"
      :title="
        isEditing ? 'Редактирование производителя' : 'Новый производитель'
      "
      :description="
        isEditing
          ? editingManufacturer?.slug
          : 'Slug используется в URL каталога'
      "
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSave">
          <SkmFormField
            v-if="!isEditing"
            label="Slug"
            required
            hint="kebab-case, например mersen"
          >
            <SkmInput v-model="form.slug" autocomplete="off" />
          </SkmFormField>
          <SkmFormField v-else label="Slug" required>
            <SkmInput v-model="form.slug" autocomplete="off" />
          </SkmFormField>
          <SkmFormField label="Название" required>
            <SkmInput v-model="form.name" autocomplete="off" />
          </SkmFormField>
          <SkmFormField label="Опубликован">
            <label class="flex items-center gap-2 text-sm text-neutral-700">
              <UCheckbox v-model="form.isPublished" />
              Показывать в публичном каталоге
            </label>
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
      v-model:open="archiveOpen"
      title="Архивировать производителя?"
      :description="
        archivingManufacturer
          ? `«${archivingManufacturer.name}» будет скрыт из каталога. Восстановление возможно позже.`
          : undefined
      "
      confirm-label="Архивировать"
      @confirm="handleArchive"
    />
  </div>
</template>
