<template>
  <div class="templates-page">
    <div class="templates-page__hero">
      <div class="container">
        <h1 class="templates-page__title">Template Gallery</h1>
        <p class="templates-page__subtitle">
          Find your perfect wedding invitation design
        </p>
      </div>
    </div>

    <!-- Cultural Styles Section -->
    <section class="cultural-section">
      <div class="container">
        <h2 class="section-title">Cultural Wedding Styles</h2>

        <div class="cultural__grid">
          <div
            v-for="style in culturalStyles"
            :key="style.name"
            class="cultural__card"
          >
            <div class="cultural__img" :style="{ background: style.bg }">
              <span class="cultural__emoji">{{ style.emoji }}</span>
            </div>
            <p class="cultural__name">{{ style.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- All Templates -->
    <TemplateGallery />
  </div>
</template>

<script setup>
const culturalStyles = [
  {
    name: "Vietnamese traditional",
    emoji: "🇻🇳",
    bg: "linear-gradient(135deg, #fde8c8, #f4c480)",
  },
  {
    name: "Korean wedding",
    emoji: "🇰🇷",
    bg: "linear-gradient(135deg, #fce4d6, #f4b8a0)",
  },
  {
    name: "Japanese minimal wedding",
    emoji: "🇯🇵",
    bg: "linear-gradient(135deg, #f0f4f8, #dde8f0)",
  },
  {
    name: "Western garden wedding",
    emoji: "🌿",
    bg: "linear-gradient(135deg, #e8f0d8, #c8dca8)",
  },
];

useSeoMeta({ title: "Templates – Leafly" });
</script>

<style scoped lang="scss">
.templates-page {
  &__hero {
    padding: 10rem 0 4rem;
    background: linear-gradient(135deg, $parchment, $cream);
    text-align: center;
  }

  &__title {
    @include font-display(clamp(2rem, 4vw, 3rem));
    color: $text-dark;
    margin-bottom: 0.75rem;
  }

  &__subtitle {
    @include font-serif(1.125rem);
    font-style: italic;
    color: $text-light;
  }
}

.cultural-section {
  @include section-padding;
  background: $white;
}

.cultural {
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  &__card {
    text-align: center;
    cursor: pointer;
  }

  &__img {
    border-radius: $radius-md;
    aspect-ratio: 3 / 4;
    @include flex-center;
    margin-bottom: 0.75rem;
    @include hover-lift;
  }

  &__emoji {
    font-size: 3rem;
  }

  &__name {
    @include font-sans(0.875rem);
    color: $text-mid;
  }

  @include respond-to(md) {
    &__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>