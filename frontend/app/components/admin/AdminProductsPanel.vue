<script setup lang="ts">
import type {
  AdminProductAssignmentOptionDto,
  AdminProductDto,
  AttachedFile,
} from '@skm/specs';
import {
  formatProductDocumentTitle,
  resolveProductSeoDescription,
  resolveProductSeoTitle,
} from '~/utils/product-seo';
import { SITE } from '~/constants/site';

defineProps<{
  canManage: boolean;
}>();

const {
  listProducts,
  listAssignmentOptions,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
  uploadProductPhoto,
  deleteProductPhoto,
  reorderProductPhotos,
  uploadProductDocument,
  deleteProductDocument,
  reorderProductDocuments,
} = useProductsAdmin();
const { hasAbsoluteControl } = usePermissions();
const toast = useToast();
const config = useRuntimeConfig();

const loading = ref(false);
const includeArchived = ref(false);
const searchQuery = ref('');
const products = ref<AdminProductDto[]>([]);
const manufacturers = ref<AdminProductAssignmentOptionDto[]>([]);
const categories = ref<AdminProductAssignmentOptionDto[]>([]);

const formOpen = ref(false);
const archiveOpen = ref(false);
const editingProduct = ref<AdminProductDto | null>(null);
const archivingProduct = ref<AdminProductDto | null>(null);

const form = reactive({
  slug: '',
  title: '',
  sku: '',
  description: '',
  specs: [{ label: '', value: '' }],
  seoTitle: '',
  seoDescription: '',
  manufacturerId: null as number | null,
  categoryId: null as number | null,
  isPublished: false,
});

const mediaPhotos = ref<AttachedFile[]>([]);
const mediaDocuments = ref<AttachedFile[]>([]);

const isEditing = computed(() => editingProduct.value !== null);
const canChangeSlug = computed(() => isEditing.value && hasAbsoluteControl());

const manufacturerOptions = computed(() =>
  manufacturers.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

const categoryOptions = computed(() =>
  categories.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

const visibleProducts = computed(() => {
  const term = searchQuery.value.trim().toLowerCase();
  if (!term) {
    return products.value;
  }

  return products.value.filter((product) => {
    const haystack = [
      product.title,
      product.sku,
      product.slug,
      product.manufacturerName,
      product.categoryName,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
});

const seoPreviewTitle = computed(() =>
  formatProductDocumentTitle(
    resolveProductSeoTitle({
      title: form.title.trim() || 'Название товара',
      seoTitle: form.seoTitle.trim() || null,
    }),
    SITE.name,
  ),
);

const seoPreviewDescription = computed(() =>
  resolveProductSeoDescription({
    description: form.description.trim() || 'Описание товара появится здесь.',
    seoDescription: form.seoDescription.trim() || null,
  }),
);

const seoPreviewUrl = computed(() => {
  const slug = editingProduct.value?.slug || 'slug-tovara';
  return `${config.public.siteUrl}/product/${slug}`;
});

async function loadProducts() {
  loading.value = true;
  try {
    products.value = await listProducts(includeArchived.value);
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить товары',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  try {
    const options = await listAssignmentOptions();
    manufacturers.value = options.manufacturers;
    categories.value = options.categories;
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить производителей и категории',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

function resetForm() {
  form.slug = '';
  form.title = '';
  form.sku = '';
  form.description = '';
  form.specs = [{ label: '', value: '' }];
  form.seoTitle = '';
  form.seoDescription = '';
  mediaPhotos.value = [];
  mediaDocuments.value = [];
  form.manufacturerId = null;
  form.categoryId = null;
  form.isPublished = false;
}

function openCreate() {
  editingProduct.value = null;
  resetForm();
  formOpen.value = true;
}

function openEdit(product: AdminProductDto) {
  editingProduct.value = product;
  form.slug = product.slug;
  form.title = product.title;
  form.sku = product.sku;
  form.description = product.description;
  form.specs =
    product.specs.length > 0
      ? product.specs.map((spec) => ({ ...spec }))
      : [{ label: '', value: '' }];
  form.seoTitle = product.seoTitle ?? '';
  form.seoDescription = product.seoDescription ?? '';
  mediaPhotos.value = [...product.photos];
  mediaDocuments.value = [...product.documents];
  form.manufacturerId = product.manufacturerId;
  form.categoryId = product.categoryId;
  form.isPublished = product.isPublished;
  formOpen.value = true;
}

function openArchive(product: AdminProductDto) {
  archivingProduct.value = product;
  archiveOpen.value = true;
}

function addSpec() {
  form.specs.push({ label: '', value: '' });
}

function removeSpec(index: number) {
  form.specs.splice(index, 1);
  if (form.specs.length === 0) {
    form.specs.push({ label: '', value: '' });
  }
}

function normalizedSpecs() {
  return form.specs
    .map((spec) => ({
      label: spec.label.trim(),
      value: spec.value.trim(),
    }))
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0);
}

async function handleSave() {
  if (form.manufacturerId === null || form.categoryId === null) {
    toast.add({
      title: 'Заполните обязательные поля',
      description: 'Выберите производителя и категорию.',
      color: 'error',
    });
    return;
  }

  if (!form.title.trim() || !form.sku.trim() || !form.description.trim()) {
    toast.add({
      title: 'Заполните обязательные поля',
      description: 'Нужны название, артикул и описание.',
      color: 'error',
    });
    return;
  }

  try {
    const payload = {
      title: form.title.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      specs: normalizedSpecs(),
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      manufacturerId: form.manufacturerId,
      categoryId: form.categoryId,
      isPublished: form.isPublished,
    };

    if (isEditing.value && editingProduct.value) {
      await updateProduct(editingProduct.value.id, {
        ...payload,
        ...(canChangeSlug.value ? { slug: form.slug.trim() } : {}),
      });
      toast.add({ title: 'Товар обновлён', color: 'success' });
    } else {
      await createProduct({
        ...payload,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
      });
      toast.add({ title: 'Товар создан', color: 'success' });
    }
    formOpen.value = false;
    await loadProducts();
  } catch (error) {
    toast.add({
      title: isEditing.value
        ? 'Не удалось обновить товар'
        : 'Не удалось создать товар',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleArchive() {
  if (!archivingProduct.value) {
    return;
  }
  try {
    await archiveProduct(archivingProduct.value.id);
    archiveOpen.value = false;
    toast.add({ title: 'Товар архивирован', color: 'success' });
    await loadProducts();
  } catch (error) {
    toast.add({
      title: 'Не удалось архивировать товар',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleRestore(product: AdminProductDto) {
  try {
    await restoreProduct(product.id);
    toast.add({ title: 'Товар восстановлен', color: 'success' });
    await loadProducts();
  } catch (error) {
    toast.add({
      title: 'Не удалось восстановить товар',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function makePhotoFirst(photoId: number) {
  const productId = editingProduct.value?.id;
  if (!productId) {
    return;
  }

  const index = mediaPhotos.value.findIndex((photo) => photo.id === photoId);
  if (index <= 0) {
    return;
  }

  const next = [...mediaPhotos.value];
  const [item] = next.splice(index, 1);
  next.unshift(item);

  try {
    const response = await reorderProductPhotos(
      productId,
      next.map((photo) => photo.id),
    );
    mediaPhotos.value = response.items;
  } catch (error) {
    toast.add({
      title: 'Не удалось сделать фото обложкой',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function movePhoto(index: number, direction: -1 | 1) {
  const productId = editingProduct.value?.id;
  const targetIndex = index + direction;
  if (
    !productId ||
    targetIndex < 0 ||
    targetIndex >= mediaPhotos.value.length
  ) {
    return;
  }

  const next = [...mediaPhotos.value];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);

  try {
    const response = await reorderProductPhotos(
      productId,
      next.map((photo) => photo.id),
    );
    mediaPhotos.value = response.items;
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить порядок фото',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function moveDocument(index: number, direction: -1 | 1) {
  const productId = editingProduct.value?.id;
  const targetIndex = index + direction;
  if (
    !productId ||
    targetIndex < 0 ||
    targetIndex >= mediaDocuments.value.length
  ) {
    return;
  }

  const next = [...mediaDocuments.value];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);

  try {
    const response = await reorderProductDocuments(
      productId,
      next.map((document) => document.id),
    );
    mediaDocuments.value = response.items;
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить порядок документов',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handlePhotoUpload(file: File) {
  const productId = editingProduct.value?.id;
  if (!productId) {
    return;
  }

  try {
    const response = await uploadProductPhoto(productId, file);
    mediaPhotos.value = [...mediaPhotos.value, response.item];
    toast.add({ title: 'Фото загружено', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить фото',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleDocumentUpload(file: File) {
  const productId = editingProduct.value?.id;
  if (!productId) {
    return;
  }

  try {
    const response = await uploadProductDocument(productId, file);
    mediaDocuments.value = [...mediaDocuments.value, response.item];
    toast.add({ title: 'Документ загружен', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить документ',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handlePhotoDelete(photoId: number) {
  const productId = editingProduct.value?.id;
  if (!productId) {
    return;
  }

  try {
    await deleteProductPhoto(productId, photoId);
    mediaPhotos.value = mediaPhotos.value.filter(
      (photo) => photo.id !== photoId,
    );
    toast.add({ title: 'Фото удалено', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось удалить фото',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleDocumentDelete(documentId: number) {
  const productId = editingProduct.value?.id;
  if (!productId) {
    return;
  }

  try {
    await deleteProductDocument(productId, documentId);
    mediaDocuments.value = mediaDocuments.value.filter(
      (document) => document.id !== documentId,
    );
    toast.add({ title: 'Документ удалён', color: 'success' });
  } catch (error) {
    toast.add({
      title: 'Не удалось удалить документ',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function togglePublished(product: AdminProductDto) {
  try {
    await updateProduct(product.id, {
      isPublished: !product.isPublished,
    });
    toast.add({
      title: product.isPublished ? 'Публикация снята' : 'Товар опубликован',
      color: 'success',
    });
    await loadProducts();
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить статус публикации',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

watch(includeArchived, () => {
  void loadProducts();
});

onMounted(() => {
  void loadProducts();
  void loadOptions();
});
</script>

<template>
  <div class="space-y-4">
    <SkmAlert
      v-if="!canManage"
      tone="warning"
      title="Только просмотр"
      description="Список товаров доступен для чтения. Для создания и правок нужна роль с правом управления товарами."
      icon="i-lucide-eye"
    />

    <div
      class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <SkmInput
          v-model="searchQuery"
          type="search"
          placeholder="Найти товар, артикул или бренд…"
          class="w-full max-w-sm"
          aria-label="Поиск по товарам"
        />
        <label class="flex items-center gap-2 text-sm text-neutral-600">
          <UCheckbox v-model="includeArchived" />
          Показать архив
        </label>
      </div>
      <SkmButton
        v-if="canManage"
        icon="i-lucide-package-plus"
        @click="openCreate"
      >
        Добавить товар
      </SkmButton>
    </div>

    <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table class="min-w-full divide-y divide-neutral-200 text-sm">
        <thead class="bg-neutral-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Товар
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Артикул
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Производитель
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Категория
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Статус
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-neutral-500">
              Загрузка…
            </td>
          </tr>
          <tr v-else-if="visibleProducts.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-neutral-500">
              {{ searchQuery.trim() ? 'Ничего не найдено' : 'Нет товаров' }}
            </td>
          </tr>
          <tr
            v-for="product in visibleProducts"
            v-else
            :key="product.id"
            :class="product.deletedAt ? 'bg-neutral-50' : undefined"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-900">
                {{ product.title }}
              </div>
              <code class="text-xs text-neutral-500">{{ product.slug }}</code>
            </td>
            <td class="px-4 py-3 text-neutral-900">
              {{ product.sku }}
            </td>
            <td class="px-4 py-3 text-neutral-700">
              {{ product.manufacturerName }}
            </td>
            <td class="px-4 py-3 text-neutral-700">
              {{ product.categoryName }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <SkmBadge
                  v-if="product.deletedAt"
                  label="В архиве"
                  tone="neutral"
                  size="sm"
                />
                <SkmBadge
                  v-else-if="product.isPublished"
                  label="Опубликован"
                  tone="accent"
                  size="sm"
                />
                <SkmBadge v-else label="Черновик" tone="neutral" size="sm" />
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-1">
                <SkmButton
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-eye"
                  :to="`/admin/catalog/products/${product.id}`"
                >
                  Просмотр
                </SkmButton>
                <template v-if="canManage">
                  <template v-if="product.deletedAt">
                    <SkmButton
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-undo-2"
                      @click="handleRestore(product)"
                    >
                      Восстановить
                    </SkmButton>
                  </template>
                  <template v-else>
                    <SkmButton
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-pencil"
                      @click="openEdit(product)"
                    >
                      Изменить
                    </SkmButton>
                    <SkmButton
                      variant="ghost"
                      size="sm"
                      :icon="
                        product.isPublished
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-globe'
                      "
                      @click="togglePublished(product)"
                    >
                      {{ product.isPublished ? 'Снять' : 'Опубликовать' }}
                    </SkmButton>
                    <SkmButton
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-archive"
                      @click="openArchive(product)"
                    >
                      Архив
                    </SkmButton>
                  </template>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SkmSlideover
      v-model:open="formOpen"
      :title="isEditing ? 'Редактирование товара' : 'Новый товар'"
      :description="
        isEditing
          ? editingProduct?.slug
          : 'Slug для страницы товара будет собран из названия'
      "
    >
      <template #body>
        <form class="space-y-6" @submit.prevent="handleSave">
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-6">
              <section class="space-y-4">
                <h3 class="text-sm font-semibold text-neutral-900">Основное</h3>
                <SkmFormField
                  v-if="isEditing"
                  label="Slug"
                  :hint="
                    canChangeSlug
                      ? 'kebab-case, часть URL страницы товара'
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
                  <SkmInput v-model="form.title" autocomplete="off" />
                </SkmFormField>
                <SkmFormField label="Артикул" required>
                  <SkmInput v-model="form.sku" autocomplete="off" />
                </SkmFormField>
                <SkmFormField label="Производитель" required>
                  <USelectMenu
                    v-model="form.manufacturerId"
                    :items="manufacturerOptions"
                    value-key="value"
                    placeholder="Выберите производителя"
                  />
                </SkmFormField>
                <SkmFormField label="Категория" required>
                  <USelectMenu
                    v-model="form.categoryId"
                    :items="categoryOptions"
                    value-key="value"
                    placeholder="Выберите категорию"
                  />
                </SkmFormField>
                <SkmFormField label="Опубликован">
                  <label
                    class="flex items-center gap-2 text-sm text-neutral-700"
                  >
                    <UCheckbox v-model="form.isPublished" />
                    Показывать на публичной странице товара
                  </label>
                </SkmFormField>
              </section>

              <section class="space-y-4">
                <h3 class="text-sm font-semibold text-neutral-900">Описание</h3>
                <SkmFormField
                  label="Описание товара"
                  required
                  hint="Попадает на страницу товара и в meta description, если SEO-поле пустое"
                >
                  <SkmTextarea
                    v-model="form.description"
                    :rows="5"
                    placeholder="Назначение, серия, типичные применения"
                  />
                </SkmFormField>
              </section>

              <section class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-neutral-900">
                    Характеристики
                  </h3>
                  <SkmButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-plus"
                    @click="addSpec"
                  >
                    Строка
                  </SkmButton>
                </div>
                <p class="text-xs text-neutral-500">
                  Ключ и значение. Пустые строки при сохранении отбрасываются.
                </p>
                <div
                  v-for="(spec, index) in form.specs"
                  :key="index"
                  class="grid grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <SkmInput v-model="spec.label" placeholder="Параметр" />
                  <SkmInput v-model="spec.value" placeholder="Значение" />
                  <SkmButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-trash-2"
                    aria-label="Удалить характеристику"
                    @click="removeSpec(index)"
                  />
                </div>
              </section>
            </div>

            <div v-if="isEditing" class="space-y-4">
              <AdminProductPhotoStrip
                :photos="mediaPhotos"
                @upload="handlePhotoUpload"
                @delete="handlePhotoDelete"
                @move="movePhoto"
                @make-first="makePhotoFirst"
              />
              <AdminProductDocumentList
                :documents="mediaDocuments"
                @upload="handleDocumentUpload"
                @delete="handleDocumentDelete"
                @move="moveDocument"
              />
            </div>

            <section
              v-else
              class="space-y-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5"
            >
              <h3 class="text-sm font-semibold text-neutral-900">Файлы</h3>
              <p class="text-sm text-neutral-500">
                Сначала сохраните товар, затем загрузите фото и документы в
                режиме редактирования.
              </p>
            </section>
          </div>

          <section
            class="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <div>
              <p class="text-sm font-medium text-neutral-900">
                Поисковая оптимизация
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                Необязательно. Если пусто, публичная страница возьмёт название и
                описание товара.
              </p>
            </div>
            <SkmFormField
              label="SEO title"
              :hint="`${form.seoTitle.trim().length} символов, ориентир 50–60`"
            >
              <SkmInput v-model="form.seoTitle" autocomplete="off" />
            </SkmFormField>
            <SkmFormField
              label="SEO description"
              :hint="`${form.seoDescription.trim().length} символов, ориентир 140–160`"
            >
              <SkmTextarea v-model="form.seoDescription" :rows="3" />
            </SkmFormField>
            <div class="rounded-md border border-neutral-200 bg-white p-3">
              <p
                class="text-xs font-medium uppercase tracking-wide text-neutral-500"
              >
                Как может выглядеть сниппет
              </p>
              <p class="mt-2 text-sm text-blue-800">
                {{ seoPreviewTitle }}
              </p>
              <p class="truncate text-xs text-green-700">
                {{ seoPreviewUrl }}
              </p>
              <p class="mt-1 line-clamp-2 text-xs text-neutral-600">
                {{ seoPreviewDescription }}
              </p>
            </div>
          </section>
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
      title="Архивировать товар?"
      :description="
        archivingProduct
          ? `«${archivingProduct.title}» исчезнет из публичного каталога и со страницы товара. Восстановление возможно позже.`
          : undefined
      "
      confirm-label="Архивировать"
      @confirm="handleArchive"
    />
  </div>
</template>
