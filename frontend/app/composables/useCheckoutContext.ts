import type { CreateOrderRequest } from '@skm/specs';
import { CustomerType } from '@skm/specs';
import type { ComputedRef, InjectionKey, Ref } from 'vue';
import {
  deriveCheckoutOrderPreview,
  type CheckoutOrderPreview,
} from '~/utils/checkout-order-preview';
import { profileToCheckoutDefaults } from '~/utils/customer-type';

export type CheckoutForm = {
  customerType: CustomerType;
  name: string;
  email: string;
  phone: string;
  company: string;
  inn: string;
  position: string;
  customerNote: string;
};

export type CheckoutContext = {
  form: CheckoutForm;
  isLegalEntity: ComputedRef<boolean>;
  orderPreview: ComputedRef<CheckoutOrderPreview>;
  totalLabel: ComputedRef<string>;
  lineItemsCount: ComputedRef<number>;
  totalQuantity: ComputedRef<number>;
  submitDisabled: ComputedRef<boolean>;
  submitting: Ref<boolean>;
  submit: () => Promise<void>;
};

export const CHECKOUT_CONTEXT_KEY: InjectionKey<CheckoutContext> =
  Symbol('checkout-context');

export function useCheckoutContext(): CheckoutContext {
  const cart = useCart();
  const auth = useAuthStore();
  const toast = useToast();
  const { api } = useApi();

  const submitting = ref(false);

  const form = reactive<CheckoutForm>({
    customerType: profileToCheckoutDefaults({
      id: 0,
      email: '',
      name: '',
      phone: null,
      company: null,
      inn: null,
      position: null,
      roles: [],
      permissions: [],
    }).customerType,
    name: '',
    email: '',
    phone: '',
    company: '',
    inn: '',
    position: '',
    customerNote: '',
  });

  watch(
    () => auth.user,
    (user) => {
      if (!user) {
        return;
      }
      Object.assign(form, profileToCheckoutDefaults(user));
    },
    { immediate: true },
  );

  const isLegalEntity = computed(
    () => form.customerType === CustomerType.legalEntity,
  );

  const orderPreview = computed(() =>
    deriveCheckoutOrderPreview(cart.items.value),
  );

  const totalLabel = computed(() =>
    cart.formatCartTotalLabel(cart.items.value),
  );

  const lineItemsCount = computed(() => cart.items.value.length);

  const totalQuantity = computed(() => cart.totalQuantity.value);

  const submitDisabled = computed(() => {
    if (
      orderPreview.value.hasUnavailable ||
      cart.isEmpty.value ||
      submitting.value
    ) {
      return true;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      return true;
    }
    if (
      form.customerType === CustomerType.legalEntity &&
      !form.company.trim()
    ) {
      return true;
    }
    return false;
  });

  async function submit() {
    if (submitDisabled.value) {
      if (orderPreview.value.hasUnavailable || cart.isEmpty.value) {
        toast.add({
          title: 'Нельзя отправить',
          description:
            'Удалите недоступные позиции или добавьте товары в корзину.',
          color: 'warning',
        });
        return;
      }
      toast.add({
        title: 'Заполните форму',
        description:
          form.customerType === CustomerType.legalEntity
            ? 'Для юр. лица нужны компания, имя и телефон.'
            : 'Нужны имя и телефон.',
        color: 'warning',
      });
      return;
    }

    submitting.value = true;
    try {
      const body: CreateOrderRequest = {
        customerType: form.customerType,
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: isLegalEntity.value ? form.company.trim() : null,
        inn: isLegalEntity.value ? form.inn.trim() || null : null,
        position: isLegalEntity.value ? form.position.trim() || null : null,
        customerNote: form.customerNote.trim() || null,
      };

      const order = await api<{ id: number; number: string }>('/orders', {
        method: 'POST',
        body,
      });

      await cart.fetchCart();
      await navigateTo(`/checkout/success?order=${order.id}`);
    } catch (error: unknown) {
      const status =
        (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { status?: number })?.status;
      if (status === 409) {
        toast.add({
          title: 'Корзина изменилась',
          description: 'Удалите недоступные позиции и попробуйте снова.',
          color: 'warning',
        });
        await cart.fetchCart();
        return;
      }
      toast.add({
        title: 'Не удалось отправить заявку',
        description: 'Попробуйте ещё раз или свяжитесь с нами.',
        color: 'danger',
      });
    } finally {
      submitting.value = false;
    }
  }

  return {
    form,
    isLegalEntity,
    orderPreview,
    totalLabel,
    lineItemsCount,
    totalQuantity,
    submitDisabled,
    submitting,
    submit,
  };
}

export function provideCheckoutContext(): CheckoutContext {
  const ctx = useCheckoutContext();
  provide(CHECKOUT_CONTEXT_KEY, ctx);
  return ctx;
}

export function useProvidedCheckoutContext(): CheckoutContext {
  const ctx = inject(CHECKOUT_CONTEXT_KEY);
  if (!ctx) {
    throw new Error('Checkout context is missing');
  }
  return ctx;
}
