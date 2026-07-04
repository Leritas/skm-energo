<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <NuxtLink to="/" class="text-lg font-bold text-blue-800">
        СКМ-Энергосервис
      </NuxtLink>
      <nav class="hidden gap-6 text-sm font-medium sm:flex">
        <NuxtLink to="/catalog" class="hover:text-blue-700">Каталог</NuxtLink>
        <NuxtLink to="/" class="hover:text-blue-700">О компании</NuxtLink>
      </nav>
      <a href="tel:+78127038727" class="text-sm font-medium text-blue-700">
        +7 (812) 703-87-27
      </a>
    </div>
  </header>
</template>
