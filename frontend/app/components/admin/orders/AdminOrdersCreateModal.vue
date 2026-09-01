<script setup lang="ts">
import type {
  AdminOrderProductOptionDto,
  AdminOrderUserOptionDto,
} from '@skm/specs';
import { useAdminOrdersState } from '~/composables/useAdminOrdersState';

const open = defineModel<boolean>('open', { default: false });

const { submitCreateOrder, saving } = useAdminOrdersState();
const { listUserOptions, listProductOptions } = useOrdersAdmin();
const toast = useToast();

const users = ref<AdminOrderUserOptionDto[]>([]);
const products = ref<AdminOrderProductOptionDto[]>([]);
const userSearch = ref('');
const selectedUserId = ref<number | null>(null);
const customerNote = ref('');

type DraftLine = {
  productId: number | null;
  quantity: number;
};

const lines = ref<DraftLine[]>([{ productId: null, quantity: 1 }]);

const selectedUser = computed(
  () => users.value.find((user) => user.id === selectedUserId.value) ?? null,
);

const productOptions = computed(() =>
  products.value.map((product) => ({
    label: `${product.title} (${product.sku})`,
    value: product.id,
  })),
);

function resetForm() {
  userSearch.value = '';
  selectedUserId.value = null;
  customerNote.value = '';
  lines.value = [{ productId: null, quantity: 1 }];
}

function addLine() {
  lines.value.push({ productId: null, quantity: 1 });
}

function removeLine(index: number) {
  if (lines.value.length === 1) {
    return;
  }
  lines.value.splice(index, 1);
}

async function loadProducts() {
  products.value = await listProductOptions();
}

async function searchUsers() {
  users.value = await listUserOptions(userSearch.value.trim() || undefined);
}

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm();
    void loadProducts();
    void searchUsers();
  }
});

watchDebounced(
  userSearch,
  () => {
    if (!open.value) {
      return;
    }
    void searchUsers();
  },
  { debounce: 300 },
);

async function submit() {
  if (!selectedUserId.value) {
    return;
  }

  const preparedLines = lines.value
    .filter((line) => line.productId !== null && line.quantity > 0)
    .map((line) => ({
      productId: line.productId!,
      quantity: line.quantity,
    }));

  if (preparedLines.length === 0) {
    toast.add({
      title: 'Добавьте хотя бы одну позицию с товаром',
      color: 'warning',
    });
    return;
  }

  const created = await submitCreateOrder({
    userId: selectedUserId.value,
    lines: preparedLines,
    customerNote: customerNote.value.trim() || null,
  });

  if (created) {
    open.value = false;
  }
}
</script>

<template>
  <SkmModal
    v-model:open="open"
    title="Создать заказ"
    description="Привязка к существующему пользователю и опубликованным товарам."
  >
    <template #body>
      <div class="space-y-5">
        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700">
            Пользователь
          </label>
          <SkmInput
            v-model="userSearch"
            type="search"
            placeholder="Поиск по email или имени…"
            class="mb-2"
          />
          <div
            class="max-h-40 overflow-y-auto rounded-lg border border-neutral-200"
          >
            <button
              v-for="user in users"
              :key="user.id"
              type="button"
              class="flex w-full flex-col px-3 py-2 text-left text-sm transition hover:bg-neutral-50"
              :class="
                selectedUserId === user.id
                  ? 'bg-accent-50 text-accent-900'
                  : 'text-neutral-800'
              "
              @click="selectedUserId = user.id"
            >
              <span class="font-medium">{{ user.email }}</span>
              <span class="text-xs text-neutral-500">{{ user.name }}</span>
            </button>
          </div>
          <p v-if="selectedUser" class="mt-2 text-xs text-neutral-500">
            Выбран: {{ selectedUser.name }} · {{ selectedUser.email }}
          </p>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-medium text-neutral-700">
              Позиции
            </label>
            <SkmButton variant="ghost" size="sm" @click="addLine">
              Добавить
            </SkmButton>
          </div>
          <div class="space-y-3">
            <div
              v-for="(line, index) in lines"
              :key="index"
              class="grid gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <USelectMenu
                v-model="line.productId"
                :items="productOptions"
                value-key="value"
                placeholder="Товар"
              />
              <SkmInput
                v-model.number="line.quantity"
                type="number"
                min="1"
                placeholder="Кол-во"
              />
              <SkmButton
                variant="ghost"
                size="sm"
                :disabled="lines.length === 1"
                @click="removeLine(index)"
              >
                Удалить
              </SkmButton>
            </div>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700">
            Примечание
          </label>
          <textarea
            v-model="customerNote"
            rows="3"
            class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Необязательно"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <SkmButton variant="outline" @click="open = false"> Отмена </SkmButton>
        <SkmButton :disabled="!selectedUserId || saving" @click="submit">
          Создать
        </SkmButton>
      </div>
    </template>
  </SkmModal>
</template>
