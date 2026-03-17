<template>
  <section class="how-it-works">
    <div class="container">
      <h2 class="section-title">How It Works</h2>

      <div class="hiw__steps">
        <div v-for="(step, i) in steps" :key="i" class="hiw__step">
          <div class="hiw__step-number">
            {{ String(i + 1).padStart(2, "0") }}
          </div>
          <div class="hiw__step-icon">{{ step.icon }}</div>
          <h3 class="hiw__step-title">{{ step.title }}</h3>
          <p class="hiw__step-desc">{{ step.desc }}</p>
        </div>

        <!-- Connector lines -->
        <div class="hiw__connector hiw__connector--1"></div>
        <div class="hiw__connector hiw__connector--2"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
const steps = [
  {
    icon: "🎨",
    title: "Choose a template",
    desc: "Choose a template that fits your style with your wish list for your guests.",
  },
  {
    icon: "✏️",
    title: "Customize your invitation",
    desc: "Customize your invitation and add your personal details and animations.",
  },
  {
    icon: "📮",
    title: "Share & collect RSVP",
    desc: "Share with guests & collect san oturmal anüson and get this goals.",
  },
];
</script>

<style scoped lang="scss">
.how-it-works {
  @include section-padding;
  background: $white;
}

.hiw {
  &__steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
    position: relative;
  }

  &__connector {
    position: absolute;
    top: 3.5rem;
    height: 2px;
    background: linear-gradient(to right, $blush, $sage-light);
    width: calc(33.33% - 3rem);
    z-index: 0;

    &--1 {
      left: calc(33.33% - 0.5rem);
    }
    &--2 {
      left: calc(66.66% - 1rem);
    }
  }

  &__step {
    background: $cream;
    border-radius: $radius-lg;
    padding: 2.5rem 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
    border: 1px solid $cream-dark;
    @include hover-lift(-6px);

    &-number {
      @include font-display(3rem, 700);
      color: $blush;
      line-height: 1;
      margin-bottom: 0.5rem;
      opacity: 0.6;
    }

    &-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    &-title {
      @include font-display(1.125rem, 600);
      color: $text-dark;
      margin-bottom: 0.75rem;
    }

    &-desc {
      font-size: 0.875rem;
      color: $text-light;
      line-height: 1.6;
    }
  }

  @include respond-to(md) {
    &__steps {
      grid-template-columns: 1fr;
    }
    &__connector {
      display: none;
    }
  }
}
</style>