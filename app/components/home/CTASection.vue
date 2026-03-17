<template>
  <!-- CTA Banner -->
  <section class="cta-banner">
    <div class="cta-banner__bg">
      <div class="cta-banner__blob"></div>
    </div>
    <div class="container cta-banner__inner">
      <div class="cta-banner__text">
        <h2 class="cta-banner__title">
          Create your beautiful wedding invitation today
        </h2>
        <div class="cta-banner__actions">
          <NuxtLink to="/create" class="btn btn-rose">Start Designing</NuxtLink>
          <NuxtLink
            to="/templates"
            class="btn btn-outline cta-banner__btn-outline"
            >Browse Templates</NuxtLink
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta-banner {
  padding: 5rem 0;
  @include gradient-bg(#d4e8c2, #f0dcc8);
  background: linear-gradient(135deg, #d4e8c2 0%, #b8d4a0 40%, #f0dcc8 100%);
  position: relative;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__blob {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba($white, 0.4), transparent);
    top: -200px;
    right: -100px;
    border-radius: 50%;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__text {
    max-width: 600px;
  }

  &__title {
    @include font-display(clamp(1.75rem, 3.5vw, 2.5rem));
    color: $text-dark;
    margin-bottom: 2rem;
    line-height: 1.25;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__btn-outline {
    border-color: $text-dark;
    color: $text-dark;
  }
}
</style>