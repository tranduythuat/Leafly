<template>
  <div>
    <div class="pricing-hero">
      <div class="container">
        <h1 class="pricing-hero__title">Simple, honest pricing</h1>
        <p class="pricing-hero__subtitle">
          Start free, upgrade when you're ready
        </p>
      </div>
    </div>
    <PricingSection />
  </div>
</template>

<script setup>
useSeoMeta({ title: "Pricing – Leafly" });
</script>

<style scoped lang="scss">
.pricing-hero {
  padding: 10rem 0 2rem;
  background: linear-gradient(135deg, $parchment, $cream);
  text-align: center;

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
</style>