<template>
  <section class="pricing">
    <div class="container">
      <h2 class="section-title">Pricing</h2>

      <div class="pricing__grid">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="pricing__card"
          :class="{ 'pricing__card--featured': plan.featured }"
        >
          <div class="pricing__header">
            <h3 class="pricing__name">{{ plan.name }}</h3>
            <div v-if="plan.price" class="pricing__price">
              <span class="pricing__currency">$</span>
              <span class="pricing__amount">{{ plan.price }}</span>
              <span class="pricing__period">/mo</span>
            </div>
            <p v-else class="pricing__free-label">Free forever</p>
          </div>

          <ul class="pricing__features">
            <li
              v-for="feat in plan.features"
              :key="feat"
              class="pricing__feature"
            >
              <span class="pricing__check">✓</span>
              {{ feat }}
            </li>
          </ul>

          <button
            class="btn pricing__cta"
            :class="plan.featured ? 'btn-primary' : 'btn-outline'"
          >
            {{ plan.cta }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const plans = [
  {
    name: "Free",
    price: null,
    cta: "Cta now",
    features: ["Free features", "Miniinverfuios", "Moscmgcorara"],
  },
  {
    name: "Premium",
    price: 12,
    cta: "Cta more",
    featured: true,
    features: ["Free features", "Premiummo features", "Promitin cards"],
  },
  {
    name: "Studio",
    price: 29,
    cta: "Cta more",
    features: [
      "Free features",
      "Premiummo features",
      "Pradion cards",
      "Handmade paper",
      "Studio customisations",
    ],
  },
];
</script>

<style scoped lang="scss">
.pricing {
  @include section-padding;
  background: $parchment;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  &__card {
    background: $white;
    border-radius: $radius-lg;
    padding: 2.5rem 2rem;
    border: 1.5px solid $cream-dark;
    @include hover-lift;

    &--featured {
      background: $sage;
      border-color: $sage;
      transform: scale(1.04);
      box-shadow: $shadow-lift;

      &:hover {
        transform: scale(1.04) translateY(-4px);
      }

      .pricing__name,
      .pricing__amount,
      .pricing__currency,
      .pricing__period,
      .pricing__feature,
      .pricing__check {
        color: $white;
      }
    }
  }

  &__name {
    @include font-display(1.25rem, 600);
    color: $text-dark;
    margin-bottom: 1.25rem;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
    margin-bottom: 1.5rem;
  }

  &__currency {
    font-size: 1rem;
    color: $text-mid;
  }

  &__amount {
    @include font-display(2.5rem, 700);
    color: $text-dark;
    line-height: 1;
  }

  &__period {
    font-size: 0.8rem;
    color: $text-light;
  }

  &__free-label {
    @include font-serif(0.9rem);
    font-style: italic;
    color: $text-light;
    margin-bottom: 1.5rem;
  }

  &__features {
    list-style: none;
    margin-bottom: 2rem;
  }

  &__feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: $text-mid;
    margin-bottom: 0.625rem;
  }

  &__check {
    color: $sage;
    font-weight: 700;
  }

  &__cta {
    width: 100%;
    justify-content: center;
  }

  @include respond-to(md) {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__card--featured {
      transform: none;
      &:hover {
        transform: translateY(-4px);
      }
    }
  }
}
</style>