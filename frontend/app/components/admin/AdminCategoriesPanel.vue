<script setup lang="ts">
import type { AdminCategoryDto, AttachedFile } from '@skm/specs';
import {
  buildAdminCategoryForest,
  collectExpandableCategoryIds,
  filterAdminCategoryForest,
  flattenAdminCategoryForest,
  getCategoryParentOptions,
} from '~/utils/admin-category-tree';

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

defineProps<{
  canManage: boolean;
}>();

const {
  listCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
  replaceCoverPhoto,
  deleteCoverPhoto,
} = useCategoriesAdmin();
const { hasAbsoluteControl } = usePermissions();
const toast = useToast();

const loading = ref(false);
const includeArchived = ref(false);
const query = ref('');
const categories = ref<AdminCategoryDto[]>([]);
const expandedIds = ref(new Set<number>());

const formOpen = ref(false);
const archiveOpen = ref(false);
const editingCategory = ref<AdminCategoryDto | null>(null);
const archivingCategory = ref<AdminCategoryDto | null>(null);

const form = reactive({
  slug: '',
  name: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
  parentKey: 'root' as number | 'root',
  isPublished: false,
});

const coverPhoto = ref<AttachedFile | null>(null);

const isEditing = computed(() => editingCategory.value !== null);
const canChangeSlug = computed(() => !isEditing.value || hasAbsoluteControl());

const visibleForest = computed(() =>
  filterAdminCategoryForest(
    buildAdminCategoryForest(categories.value),
    query.value,
  ),
);

const rows = computed(() =>
  flattenAdminCategoryForest(visibleForest.value, expandedIds.value),
);

const parentOptions = computed(() => [
  { label: 'Корень каталога', value: 'root' as const },
  ...getCategoryParentOptions(
    categories.value,
    editingCategory.value?.id ?? null,
  ),
]);

const emptyTitle = computed(() =>
  query.value.trim()
    ? 'Ничего не найдено'
    : includeArchived.value
      ? 'Нет категорий'
      : 'Дерево категорий пусто',
);

const emptyDescription = computed(() =>
  query.value.trim()
    ? 'Попробуйте другой запрос или сбросьте поиск.'
    : 'Создайте корневую категорию — внутри неё можно завести вложенные разделы.',
);

watch(query, (value) => {
  if (value.trim()) {
    expandedIds.value = new Set(
      collectExpandableCategoryIds(visibleForest.value),
    );
    return;
  }
  expandedIds.value = new Set();
});

async function loadCategories() {
  loading.value = true;
  try {
    categories.value = await listCategories(includeArchived.value);
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить категории',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function resetForm(parentId: number | null = null) {
  form.slug = '';
  form.name = '';
  form.description = '';
  form.seoTitle = '';
  form.seoDescription = '';
  form.parentKey = parentId ?? 'root';
  form.isPublished = false;
  coverPhoto.value = null;
}

function openCreate(parentId: number | null = null) {
  editingCategory.value = null;
  resetForm(parentId);
  formOpen.value = true;
}

function openEdit(category: AdminCategoryDto) {
  editingCategory.value = category;
  form.slug = category.slug;
  form.name = category.name;
  form.description = category.description ?? '';
  form.seoTitle = category.seoTitle ?? '';
  form.seoDescription = category.seoDescription ?? '';
  form.parentKey = category.parentId ?? 'root';
  form.isPublished = category.isPublished;
  coverPhoto.value = category.coverPhoto;
  formOpen.value = true;
}

function openArchive(category: AdminCategoryDto) {
  archivingCategory.value = category;
  archiveOpen.value = true;
}

function toggleExpanded(category: AdminCategoryDto) {
  const next = new Set(expandedIds.value);
  if (next.has(category.id)) {
    next.delete(category.id);
  } else {
    next.add(category.id);
  }
  expandedIds.value = next;
}

function expandAll() {
  expandedIds.value = new Set(
    collectExpandableCategoryIds(visibleForest.value),
  );
}

function collapseAll() {
  expandedIds.value = new Set();
}

function parentIdFromForm() {
  return form.parentKey === 'root' ? null : form.parentKey;
}

async function handleSave() {
  try {
    if (isEditing.value && editingCategory.value) {
      await updateCategory(editingCategory.value.id, {
        ...(canChangeSlug.value ? { slug: form.slug.trim() } : {}),
        name: form.name.trim(),
        description: form.description.trim() || null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        parentId: parentIdFromForm(),
        isPublished: form.isPublished,
      });
      toast.add({ title: 'Категория обновлена', color: 'success' });
    } else {
      if (!CATEGORY_SLUG_PATTERN.test(form.slug.trim())) {
        toast.add({
          title: 'Некорректный slug',
          description: 'Используйте kebab-case: predohraniteli',
          color: 'error',
        });
        return;
      }
      await createCategory({
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        parentId: parentIdFromForm(),
        isPublished: form.isPublished,
      });
      toast.add({ title: 'Категория создана', color: 'success' });
    }
    formOpen.value = false;
    await loadCategories();
  } catch (error) {
    toast.add({
      title: isEditing.value
        ? 'Не удалось обновить категорию'
        : 'Не удалось создать категорию',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleArchive() {
  if (!archivingCategory.value) {
    return;
  }
  try {
    await archiveCategory(archivingCategory.value.id);
    archiveOpen.value = false;
    toast.add({ title: 'Категория архивирована', color: 'success' });
    await loadCategories();
  } catch (error) {
    toast.add({
      title: 'Не удалось архивировать категорию',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleRestore(category: AdminCategoryDto) {
  try {
    await restoreCategory(category.id);
    toast.add({ title: 'Категория восстановлена', color: 'success' });
    await loadCategories();
  } catch (error) {
    toast.add({
      title: 'Не удалось восстановить категорию',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleCoverReplace(file: File) {
  const categoryId = editingCategory.value?.id;
  if (!categoryId) {
    return;
  }

  try {
    const response = await replaceCoverPhoto(categoryId, file);
    coverPhoto.value = response.photo;
    toast.add({ title: 'Обложка обновлена', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить обложку',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleCoverDelete() {
  const categoryId = editingCategory.value?.id;
  if (!categoryId) {
    return;
  }

  try {
    await deleteCoverPhoto(categoryId);
    coverPhoto.value = null;
    toast.add({ title: 'Обложка удалена', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось удалить обложку',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function togglePublished(category: AdminCategoryDto) {
  try {
    await updateCategory(category.id, {
      isPublished: !category.isPublished,
    });
    toast.add({
      title: category.isPublished
        ? 'Публикация снята'
        : 'Категория опубликована',
      color: 'success',
    });
    await loadCategories();
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить статус публикации',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

watch(includeArchived, () => {
  void loadCategories();
});

onMounted(() => {
  void loadCategories();
});
</script>

<template>
  <div class="space-y-4">
    <SkmAlert
      v-if="!canManage"
      tone="warning"
      title="Только просмотр"
      description="Дерево категорий доступно для чтения. Для создания и правок нужна роль с правом управления категориями."
      icon="i-lucide-eye"
    />

    <div
      class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <SkmInput
          v-model="query"
          type="search"
          placeholder="Найти категорию…"
          class="w-full max-w-sm"
          aria-label="Поиск по дереву категорий"
        />
        <label class="flex items-center gap-2 text-sm text-neutral-600">
          <UCheckbox v-model="includeArchived" />
          Показать архив
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <SkmButton
          variant="ghost"
          size="sm"
          icon="i-lucide-chevrons-up-down"
          :disabled="rows.length === 0"
          @click="expandAll"
        >
          Развернуть
        </SkmButton>
        <SkmButton
          variant="ghost"
          size="sm"
          icon="i-lucide-chevrons-down-up"
          :disabled="expandedIds.size === 0"
          @click="collapseAll"
        >
          Свернуть
        </SkmButton>
        <SkmButton
          v-if="canManage"
          icon="i-lucide-folder-plus"
          @click="openCreate()"
        >
          Добавить категорию
        </SkmButton>
      </div>
    </div>

    <AdminCategoryTree
      :rows="rows"
      :expanded-ids="expandedIds"
      :can-manage="canManage"
      :loading="loading"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      @toggle="toggleExpanded"
      @edit="openEdit"
      @create-child="(category) => openCreate(category.id)"
      @toggle-published="togglePublished"
      @archive="openArchive"
      @restore="handleRestore"
    />

    <SkmSlideover
      v-model:open="formOpen"
      :title="isEditing ? 'Редактирование категории' : 'Новая категория'"
      :description="
        isEditing
          ? editingCategory?.slug
          : 'Slug попадёт в URL публичного каталога'
      "
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="handleSave">
          <SkmFormField
            label="Slug"
            required
            :hint="
              canChangeSlug
                ? 'kebab-case, например nizkovoltnye-predohraniteli'
                : 'Сменить slug может только пользователь с абсолютным контролем'
            "
          >
            <SkmInput
              v-model="form.slug"
              autocomplete="off"
              :disabled="!canChangeSlug"
            />
          </SkmFormField>

          <SkmFormField label="Название" required>
            <SkmInput v-model="form.name" autocomplete="off" />
          </SkmFormField>

          <SkmFormField
            label="Родитель"
            hint="«Корень каталога» — самый верхний уровень"
          >
            <USelectMenu
              v-model="form.parentKey"
              :items="parentOptions"
              value-key="value"
              placeholder="Корень каталога"
            />
          </SkmFormField>

          <SkmFormField label="Описание">
            <SkmTextarea
              v-model="form.description"
              :rows="3"
              placeholder="Коротко, для админки и будущих карточек раздела"
            />
          </SkmFormField>

          <SkmFormField label="Опубликована">
            <label class="flex items-center gap-2 text-sm text-neutral-700">
              <UCheckbox v-model="form.isPublished" />
              Показывать в публичном каталоге
            </label>
          </SkmFormField>

          <AdminCoverPhotoSlot
            v-if="isEditing"
            :cover-photo="coverPhoto"
            @replace="handleCoverReplace"
            @delete="handleCoverDelete"
          />
          <section
            v-else
            class="space-y-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5"
          >
            <h3 class="text-sm font-semibold text-neutral-900">Обложка</h3>
            <p class="text-sm text-neutral-500">
              Сначала сохраните категорию, затем загрузите обложку в режиме
              редактирования.
            </p>
          </section>

          <div
            class="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <div>
              <p class="text-sm font-medium text-neutral-900">
                Поисковая оптимизация
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                Необязательно. Если пусто, публичная страница возьмёт название
                категории.
              </p>
            </div>
            <SkmFormField label="SEO title">
              <SkmInput v-model="form.seoTitle" autocomplete="off" />
            </SkmFormField>
            <SkmFormField label="SEO description">
              <SkmTextarea v-model="form.seoDescription" :rows="3" />
            </SkmFormField>
          </div>
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
    </SkmSlideover>

    <SkmConfirmModal
      v-model:open="archiveOpen"
      title="Архивировать категорию?"
      :description="
        archivingCategory
          ? `«${archivingCategory.name}» исчезнет из публичного каталога. Восстановление возможно позже.`
          : undefined
      "
      confirm-label="Архивировать"
      @confirm="handleArchive"
    />
  </div>
</template>
