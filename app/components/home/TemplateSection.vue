<template>
  <section class="gallery">
    <div class="container">
      <h2 class="section-title">Template Gallery</h2>
      <p class="section-subtitle">Find your perfect design</p>

      <!-- Filter tabs -->
      <div class="gallery__filters">
        <button
          v-for="cat in categories"
          :key="cat"
          class="gallery__filter-btn"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Grid -->
      <div class="gallery__grid">
        <div
          v-for="(template, i) in filteredTemplates"
          :key="template.id"
          class="gallery__card"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <div class="gallery__card-preview" :style="{ background: template.bg }">
            <div class="gallery__card-inner">
              <div class="gallery__card-floral">{{ template.floral }}</div>
              <p class="gallery__card-couple">{{ template.couple }}</p>
              <p class="gallery__card-date">{{ template.date }}</p>
            </div>
            <!-- Hover overlay -->
            <div class="gallery__card-overlay">
              <NuxtLink to="/templates" class="btn btn-primary btn--sm">Quick preview</NuxtLink>
            </div>
          </div>
          <div class="gallery__card-info">
            <span class="gallery__card-name">{{ template.name }}</span>
            <span class="gallery__card-category">{{ template.category }}</span>
          </div>
        </div>
      </div>

      <div class="gallery__cta">
        <NuxtLink to="/templates" class="btn btn-outline">View all templates →</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = ['All', 'Garden', 'Minimal', 'Traditional', 'Modern', 'Cultural']
const activeCategory = ref('All')

const templates = [
  { id: 1, name: 'Garden', category: 'Garden', couple: 'Emma & Liam', date: 'May 2025', bg: 'linear-gradient(135deg, #d4e8c2, #b8d4a0)', floral: '🌸' },
  { id: 2, name: 'Korean', category: 'Cultural', couple: '지수 & 민준', date: 'June 2025', bg: 'linear-gradient(135deg, #fce4d6, #f4b8a0)', floral: '🌺' },
  { id: 3, name: 'Japanese minimal', category: 'Minimal', couple: 'Yuki & Haruto', date: 'April 2025', bg: 'linear-gradient(135deg, #f0f4f8, #dde8f0)', floral: '🌸' },
  { id: 4, name: 'Modern', category: 'Modern', couple: 'Claire & Noah', date: 'July 2025', bg: 'linear-gradient(135deg, #2c2416, #5c4a32)', floral: '✦' },
  { id: 5, name: 'Vietnamese', category: 'Cultural', couple: 'Linh & Tuấn', date: 'March 2025', bg: 'linear-gradient(135deg, #fde8c8, #f4c480)', floral: '🪷' },
  { id: 6, name: 'Western garden', category: 'Garden', couple: 'Sophie & James', date: 'August 2025', bg: 'linear-gradient(135deg, #e8f0d8, #c8dca8)', floral: '🌿' },
]

const filteredTemplates = computed(() =>
  activeCategory.value === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory.value)
)
</script>

<style scoped lang="scss">
.gallery {
  @include section-padding;
  background: $cream;

  &__filters {
    display: flex;
    justify-content: center;
    gap: 0.625rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
  }

  &__filter-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    border: 1.5px solid $cream-dark;
    background: $white;
    @include font-sans(0.8rem, 500);
    color: $text-mid;
    cursor: pointer;
    transition: all 0.25s;

    &:hover,
    &.active {
      background: $sage;
      border-color: $sage;
      color: $white;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  &__card {
    animation: fadeInUp 0.5s ease both;

    &-preview {
      border-radius: $radius-md;
      aspect-ratio: 3 / 4;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      box-shadow: $shadow-soft;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: $shadow-card;

        .gallery__card-overlay { opacity: 1; }
      }
    }

    &-inner {
      text-align: center;
      padding: 1.5rem;
    }

    &-floral  { font-size: 1.5rem; margin-bottom: 0.5rem; }

    &-couple  {
      @include font-display(0.9rem);
      font-style: italic;
      color: $text-dark;
      opacity: 0.85;
    }

    &-date {
      font-size: 0.7rem;
      color: $text-mid;
      margin-top: 0.25rem;
      opacity: 0.7;
    }

    &-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      @include flex-center;
      opacity: 0;
      transition: opacity 0.3s;
      border-radius: $radius-md;
    }

    &-info {
      @include flex-between;
      margin-top: 0.75rem;
      padding: 0 0.25rem;
    }

    &-name {
      @include font-sans(0.85rem, 500);
      color: $text-dark;
    }

    &-category {
      font-size: 0.7rem;
      color: $text-light;
      background: $cream-dark;
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
    }
  }

  &__cta { text-align: center; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>