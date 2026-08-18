import { Permission } from '@skm/specs';

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.hasAbsoluteControl]: 'Полный контроль',
  [Permission.hasAccessToAdmin]: 'Доступ в админку',
  [Permission.canCreateRoles]: 'Создание ролей',
  [Permission.canManageRoles]: 'Управление ролями',
  [Permission.canCreateUsers]: 'Создание пользователей',
  [Permission.canDeleteUsers]: 'Удаление пользователей',
  [Permission.canManageUserRoles]: 'Назначение ролей',
  [Permission.hasAccessToOrders]: 'Просмотр заказов',
  [Permission.canManageOrders]: 'Управление заказами',
  [Permission.hasAccessToNews]: 'Просмотр новостей',
  [Permission.canManageNews]: 'Управление новостями',
  [Permission.canCreateItems]: 'Создание товаров',
  [Permission.canManageItems]: 'Управление каталогом',
};

export const PERMISSION_GROUPS: readonly {
  label: string;
  permissions: readonly Permission[];
}[] = [
  {
    label: 'Администрирование',
    permissions: [
      Permission.hasAbsoluteControl,
      Permission.hasAccessToAdmin,
      Permission.canCreateRoles,
      Permission.canManageRoles,
      Permission.canCreateUsers,
      Permission.canDeleteUsers,
      Permission.canManageUserRoles,
    ],
  },
  {
    label: 'Заказы',
    permissions: [Permission.hasAccessToOrders, Permission.canManageOrders],
  },
  {
    label: 'Новости',
    permissions: [Permission.hasAccessToNews, Permission.canManageNews],
  },
  {
    label: 'Каталог',
    permissions: [Permission.canCreateItems, Permission.canManageItems],
  },
];
