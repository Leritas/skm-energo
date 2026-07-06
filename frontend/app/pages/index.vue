<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `${SITE.name} — поставка электрооборудования`,
  description: SITE.tagline,
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeProductDirections />
    <HomeAboutTeaser />
  </div>
</template>
