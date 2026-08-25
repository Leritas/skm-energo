import { CustomerType, type AuthUserDto } from '@skm/specs';

export const CUSTOMER_TYPE_OPTIONS: Array<{
  value: CustomerType;
  label: string;
  description: string;
}> = [
  {
    value: CustomerType.individual,
    label: 'Физическое лицо',
    description: 'Заказ от своего имени',
  },
  {
    value: CustomerType.legalEntity,
    label: 'Юридическое лицо',
    description: 'Компания или ИП',
  },
];

export function customerTypeLabel(type: CustomerType): string {
  switch (type) {
    case CustomerType.individual:
      return 'Физическое лицо';
    case CustomerType.legalEntity:
      return 'Юридическое лицо';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function inferCustomerType(input: {
  company: string | null | undefined;
}): CustomerType {
  if (input.company?.trim()) {
    return CustomerType.legalEntity;
  }
  return CustomerType.individual;
}

export function profileToCheckoutDefaults(user: AuthUserDto) {
  return {
    customerType: inferCustomerType(user),
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    company: user.company ?? '',
    inn: user.inn ?? '',
    position: user.position ?? '',
    customerNote: '',
  };
}
