<template>
  <section class="features">
    <div class="container">
      <h2 class="section-title">Features</h2>

      <div class="features__grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="features__card"
        >
          <div class="features__icon">{{ feature.icon }}</div>
          <div class="features__content">
            <h3 class="features__title">{{ feature.title }}</h3>
            <p class="features__desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { icon: "🖱️", title: "Drag & Drop", desc: "Invitation editor" },
  { icon: "📋", title: "RSVP", desc: "Guest management" },
  { icon: "📱", title: "QR Code", desc: "For physical invitations" },
  { icon: "📍", title: "Photo gallery", desc: "Google Maps location" },
  { icon: "🌐", title: "Multi-language", desc: "Multi-language support" },
  { icon: "📲", title: "Mobile friendly", desc: "Invitations" },
];
</script>

<style scoped lang="scss">
.features {
  @include section-padding;
  background: $white;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    max-width: 700px;
    margin: 0 auto;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    background: $cream;
    border-radius: $radius-md;
    padding: 1.5rem;
    border: 1px solid $cream-dark;
    @include hover-lift(-3px, $shadow-soft);
  }

  &__icon {
    font-size: 1.75rem;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    background: $white;
    border-radius: $radius-sm;
    @include flex-center;
    box-shadow: $shadow-soft;
  }

  &__title {
    @include font-display(1rem, 600);
    color: $text-dark;
    margin-bottom: 0.2rem;
  }

  &__desc {
    font-size: 0.8rem;
    color: $text-light;
  }

  @include respond-to(sm) {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>