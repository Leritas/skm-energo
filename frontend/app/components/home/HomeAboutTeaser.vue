<template>
  <AppSection>
    <AppContainer>
      <div class="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900 md:text-3xl">
            О компании
          </h2>
          <p class="mt-4 text-neutral-600 leading-relaxed">
            Основным видом деятельности компании ООО «СКМ-Энергосервис» является
            поиск, подборка, а в требуемых случаях установка электронных
            компонентов для нужд отечественных предприятий легкой и тяжелой
            промышленности.
          </p>
          <p class="mt-4 text-neutral-600 leading-relaxed">
            Сотрудничество с ведущими мировыми производителями позволяет нам в
            кратчайшие сроки осуществлять поставку необходимого оборудования.
          </p>
          <AppButton class="mt-6" variant="outline" to="/about">
            Подробнее о компании
          </AppButton>
        </div>
        <div class="rounded-xl border border-neutral-100 bg-neutral-50 p-8">
          <h3 class="text-lg font-semibold text-neutral-900">
            Основные направления
          </h3>
          <ul class="mt-4 space-y-2 text-sm text-neutral-600">
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-accent-500" />
              Предохранители
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-accent-500" />
              Графитовые щётки
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-accent-500" />
              Разъединители
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-accent-500" />
              Контакторы
            </li>
          </ul>
        </div>
      </div>
    </AppContainer>
  </AppSection>
</template>
