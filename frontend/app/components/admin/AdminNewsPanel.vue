<script setup lang="ts">
import type { AdminNewsArticleDto } from '@skm/specs';

const NEWS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

defineProps<{
  canManage: boolean;
}>();

const {
  listArticles,
  createArticle,
  updateArticle,
  archiveArticle,
  restoreArticle,
} = useNewsAdmin();
const { hasAbsoluteControl } = usePermissions();
const toast = useToast();

const loading = ref(false);
const includeArchived = ref(false);
const articles = ref<AdminNewsArticleDto[]>([]);

const formOpen = ref(false);
const archiveOpen = ref(false);
const editingArticle = ref<AdminNewsArticleDto | null>(null);
const archivingArticle = ref<AdminNewsArticleDto | null>(null);

const form = reactive({
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  publishDate: '',
  published: false,
  seoTitle: '',
  seoDescription: '',
});

const isEditing = computed(() => editingArticle.value !== null);
const canChangeSlug = computed(() => !isEditing.value || hasAbsoluteControl());

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function bodyToText(body: string[]) {
  return body.join('\n\n');
}

function textToBody(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

async function loadArticles() {
  loading.value = true;
  try {
    articles.value = await listArticles(includeArchived.value);
  } catch (error) {
    toast.add({
      title: 'Не удалось загрузить новости',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.slug = '';
  form.title = '';
  form.excerpt = '';
  form.body = '';
  form.publishDate = todayIsoDate();
  form.published = false;
  form.seoTitle = '';
  form.seoDescription = '';
}

function openCreate() {
  editingArticle.value = null;
  resetForm();
  formOpen.value = true;
}

function openEdit(article: AdminNewsArticleDto) {
  editingArticle.value = article;
  form.slug = article.slug;
  form.title = article.title;
  form.excerpt = article.excerpt;
  form.body = bodyToText(article.body);
  form.publishDate = article.publishDate;
  form.published = article.published;
  form.seoTitle = article.seoTitle ?? '';
  form.seoDescription = article.seoDescription ?? '';
  formOpen.value = true;
}

function openArchive(article: AdminNewsArticleDto) {
  archivingArticle.value = article;
  archiveOpen.value = true;
}

async function handleSave() {
  const body = textToBody(form.body);
  if (body.length === 0) {
    toast.add({
      title: 'Добавьте текст новости',
      description: 'Разделяйте абзацы пустой строкой.',
      color: 'error',
    });
    return;
  }

  try {
    if (isEditing.value && editingArticle.value) {
      await updateArticle(editingArticle.value.id, {
        ...(canChangeSlug.value ? { slug: form.slug.trim() } : {}),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        body,
        publishDate: form.publishDate,
        published: form.published,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
      });
      toast.add({ title: 'Новость обновлена', color: 'success' });
    } else {
      if (!NEWS_SLUG_PATTERN.test(form.slug.trim())) {
        toast.add({
          title: 'Некорректный slug',
          description: 'Используйте kebab-case: hiitio-expand',
          color: 'error',
        });
        return;
      }
      await createArticle({
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        body,
        publishDate: form.publishDate,
        published: form.published,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
      });
      toast.add({ title: 'Новость создана', color: 'success' });
    }
    formOpen.value = false;
    await loadArticles();
  } catch (error) {
    toast.add({
      title: isEditing.value
        ? 'Не удалось обновить новость'
        : 'Не удалось создать новость',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleArchive() {
  if (!archivingArticle.value) {
    return;
  }
  try {
    await archiveArticle(archivingArticle.value.id);
    archiveOpen.value = false;
    toast.add({ title: 'Новость архивирована', color: 'success' });
    await loadArticles();
  } catch (error) {
    toast.add({
      title: 'Не удалось архивировать новость',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function handleRestore(article: AdminNewsArticleDto) {
  try {
    await restoreArticle(article.id);
    toast.add({ title: 'Новость восстановлена', color: 'success' });
    await loadArticles();
  } catch (error) {
    toast.add({
      title: 'Не удалось восстановить новость',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

async function togglePublished(article: AdminNewsArticleDto) {
  try {
    await updateArticle(article.id, {
      published: !article.published,
    });
    toast.add({
      title: article.published ? 'Публикация снята' : 'Новость опубликована',
      color: 'success',
    });
    await loadArticles();
  } catch (error) {
    toast.add({
      title: 'Не удалось изменить статус публикации',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    });
  }
}

watch(includeArchived, () => {
  void loadArticles();
});

onMounted(() => {
  void loadArticles();
});
</script>

<template>
  <div class="space-y-4">
    <SkmAlert
      v-if="!canManage"
      tone="warning"
      title="Только просмотр"
      description="Список новостей доступен для чтения. Для создания и правок нужна роль с правом управления новостями."
      icon="i-lucide-eye"
    />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="flex items-center gap-2 text-sm text-neutral-600">
        <UCheckbox v-model="includeArchived" />
        Показать архив
      </label>
      <SkmButton v-if="canManage" icon="i-lucide-newspaper" @click="openCreate">
        Добавить новость
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
              Заголовок
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Дата
            </th>
            <th class="px-4 py-3 text-left font-medium text-neutral-700">
              Статус
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
          <tr v-else-if="articles.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-500">
              Нет новостей
            </td>
          </tr>
          <tr
            v-for="article in articles"
            v-else
            :key="article.id"
            :class="article.deletedAt ? 'bg-neutral-50' : undefined"
          >
            <td class="px-4 py-3">
              <code class="text-neutral-900">{{ article.slug }}</code>
            </td>
            <td class="px-4 py-3 text-neutral-900">
              {{ article.title }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ article.publishDate }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <SkmBadge
                  v-if="article.deletedAt"
                  label="В архиве"
                  tone="neutral"
                  size="sm"
                />
                <SkmBadge
                  v-else-if="article.published"
                  label="Опубликована"
                  tone="accent"
                  size="sm"
                />
                <SkmBadge v-else label="Черновик" tone="neutral" size="sm" />
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="canManage" class="flex justify-end gap-1">
                <template v-if="article.deletedAt">
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-undo-2"
                    @click="handleRestore(article)"
                  >
                    Восстановить
                  </SkmButton>
                </template>
                <template v-else>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="openEdit(article)"
                  >
                    Изменить
                  </SkmButton>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    :icon="
                      article.published ? 'i-lucide-eye-off' : 'i-lucide-eye'
                    "
                    @click="togglePublished(article)"
                  >
                    {{ article.published ? 'Снять' : 'Опубликовать' }}
                  </SkmButton>
                  <SkmButton
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-archive"
                    @click="openArchive(article)"
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

    <SkmSlideover
      v-model:open="formOpen"
      :title="isEditing ? 'Редактирование новости' : 'Новая новость'"
      :description="
        isEditing
          ? editingArticle?.slug
          : 'Slug попадёт в URL публичной страницы'
      "
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="handleSave">
          <SkmFormField
            label="Slug"
            required
            :hint="
              canChangeSlug
                ? 'kebab-case, например hiitio-expand'
                : 'Сменить slug может только пользователь с абсолютным контролем'
            "
          >
            <SkmInput
              v-model="form.slug"
              autocomplete="off"
              :disabled="!canChangeSlug"
            />
          </SkmFormField>

          <SkmFormField label="Заголовок" required>
            <SkmInput v-model="form.title" autocomplete="off" />
          </SkmFormField>

          <SkmFormField label="Анонс" required>
            <SkmTextarea
              v-model="form.excerpt"
              :rows="3"
              placeholder="Короткий текст для карточки в списке"
            />
          </SkmFormField>

          <SkmFormField
            label="Текст"
            required
            hint="Абзацы разделяйте пустой строкой"
          >
            <SkmTextarea
              v-model="form.body"
              :rows="10"
              placeholder="Первый абзац.&#10;&#10;Второй абзац."
            />
          </SkmFormField>

          <SkmFormField label="Дата публикации" required>
            <SkmInput v-model="form.publishDate" type="date" />
          </SkmFormField>

          <SkmFormField label="Опубликована">
            <label class="flex items-center gap-2 text-sm text-neutral-700">
              <UCheckbox v-model="form.published" />
              Показывать на публичной странице /news
            </label>
          </SkmFormField>

          <div
            class="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <div>
              <p class="text-sm font-medium text-neutral-900">
                Поисковая оптимизация
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                Необязательно. Если пусто, публичная страница возьмёт заголовок
                и анонс.
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
      title="Архивировать новость?"
      :description="
        archivingArticle
          ? `«${archivingArticle.title}» исчезнет с публичной страницы. Восстановление возможно позже.`
          : undefined
      "
      confirm-label="Архивировать"
      @confirm="handleArchive"
    />
  </div>
</template>
