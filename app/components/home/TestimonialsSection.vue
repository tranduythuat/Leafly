<template>
  <section class="testimonials">
    <div class="container">
      <h2 class="section-title">Testimonials</h2>

      <div class="testimonials__grid">
        <div v-for="(t, i) in testimonials" :key="i" class="testimonials__card">
          <p class="testimonials__quote">"{{ t.quote }}"</p>
          <div class="testimonials__author">
            <div class="testimonials__avatar">{{ t.initials }}</div>
            <span class="testimonials__name">{{ t.name }}</span>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="testimonials__dots">
        <span
          v-for="i in 4"
          :key="i"
          class="testimonials__dot"
          :class="{ active: i === 1 }"
        ></span>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    quote:
      "The sorts and bacation sowe couples old orocho-laens cupcke stebl-ast a opera couples exeit sarn citare and oatmeifh rosn rodaties in your frontier.",
    name: "Sean Slavin",
    initials: "SS",
  },
  {
    quote:
      "Walra your wedding and cans stebl-ast a opera couples exait sarn citare and oatmeifh rosn rodatles in your frontier.",
    name: "Boin Africa",
    initials: "BA",
  },
  {
    quote: "Love with cour rouqples and azkelaominting ebevers and sarn-marco.",
    name: "Dan & Kastom",
    initials: "DK",
  },
];
</script>

<style scoped lang="scss">
.testimonials {
  @include section-padding;
  background: $white;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  &__card {
    background: $cream;
    border-radius: $radius-md;
    padding: 2rem;
    border: 1px solid $cream-dark;
    @include hover-lift(-4px, $shadow-soft);
  }

  &__quote {
    @include font-serif(0.95rem);
    font-style: italic;
    color: $text-mid;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $sage;
    color: $white;
    @include flex-center;
    @include font-sans(0.75rem, 600);
  }

  &__name {
    @include font-sans(0.85rem, 500);
    color: $text-dark;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $cream-dark;
    cursor: pointer;
    transition: background 0.2s, width 0.2s;

    &.active {
      background: $sage;
      width: 20px;
      border-radius: 4px;
    }
  }

  @include respond-to(md) {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>