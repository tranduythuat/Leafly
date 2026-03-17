<template>
  <section class="hero">
    <!-- Decorative background blobs -->
    <div class="hero__bg">
      <div class="hero__blob hero__blob--1"></div>
      <div class="hero__blob hero__blob--2"></div>
    </div>

    <div class="container hero__inner">
      <!-- Left: Text content -->
      <div class="hero__content">
        <p class="hero__eyebrow">✦ Online Wedding Invitations</p>
        <h1 class="hero__title">
          Create Beautiful
          <em>Online Wedding</em>
          Invitations
        </h1>
        <p class="hero__subtitle">
          Elegant, modern, and easy to share with your guests
        </p>
        <div class="hero__actions">
          <NuxtLink to="/create" class="btn btn-primary"
            >Create Your Invitation</NuxtLink
          >
          <NuxtLink to="/templates" class="btn btn-outline"
            >View Templates</NuxtLink
          >
        </div>

        <!-- Stats -->
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-number">10K+</span>
            <span class="hero__stat-label">Couples</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-number">50+</span>
            <span class="hero__stat-label">Templates</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-number">4.9★</span>
            <span class="hero__stat-label">Rating</span>
          </div>
        </div>
      </div>

      <!-- Right: Invitation card preview -->
      <div class="hero__visual">
        <div class="hero__envelope">
          <div class="hero__envelope-body">
            <div class="hero__envelope-flap"></div>
            <div class="hero__invitation-card">
              <div class="hero__card-floral">🌸</div>
              <p class="hero__card-label">Wedding Invitation</p>
              <h3 class="hero__card-names">Sophie & James</h3>
              <p class="hero__card-date">June 14, 2025</p>
              <div class="hero__card-divider"></div>
              <p class="hero__card-venue">Villa Rosa, Tuscany</p>
              <button class="hero__card-rsvp">RSVP</button>
            </div>
          </div>
        </div>

        <!-- Floating badge -->
        <div class="hero__badge">
          <span class="hero__badge-icon">🌿</span>
          <div>
            <strong>100+ designs</strong>
            <span>just created</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 7rem 0 4rem;
  position: relative;
  overflow: hidden;
  @include gradient-bg($parchment, #edf0e4);
  background: linear-gradient(135deg, $parchment 0%, $cream 60%, #edf0e4 100%);

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;

    &--1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, $blush, transparent);
      top: -100px;
      right: -80px;
    }

    &--2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #c8d8b0, transparent);
      bottom: -80px;
      left: -60px;
    }
  }

  &__inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  // --- Text ---
  &__eyebrow {
    @include font-sans(0.8rem, 500);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $sage;
    margin-bottom: 1rem;
  }

  &__title {
    @include font-display(clamp(2.2rem, 4.5vw, 3.5rem));
    line-height: 1.15;
    color: $text-dark;
    margin-bottom: 1.25rem;

    em {
      font-style: italic;
      color: $dusty-rose;
      display: block;
    }
  }

  &__subtitle {
    @include font-serif(1.2rem);
    color: $text-light;
    margin-bottom: 2rem;
    font-style: italic;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    margin-bottom: 2.5rem;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  &__stat {
    display: flex;
    flex-direction: column;

    &-number {
      @include font-display(1.5rem, 600);
      color: $text-dark;
    }

    &-label {
      @include font-sans(0.75rem);
      color: $text-light;
      letter-spacing: 0.05em;
    }

    &-divider {
      width: 1px;
      height: 36px;
      background: $cream-dark;
    }
  }

  // --- Visual ---
  &__visual {
    position: relative;
    display: flex;
    justify-content: center;
  }

  &__envelope {
    position: relative;
    width: 340px;
    animation: float 5s ease-in-out infinite;

    &-body {
      background: linear-gradient(145deg, #edd5c0, #deb99a);
      border-radius: $radius-lg;
      padding: 2.5rem;
      box-shadow: $shadow-lift;
      position: relative;
      overflow: hidden;
    }

    &-flap {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(160deg, #d4a882, transparent);
      clip-path: polygon(0 0, 100% 0, 50% 70%);
    }
  }

  &__invitation-card {
    background: $white;
    border-radius: $radius-md;
    padding: 2rem 1.5rem;
    text-align: center;
    box-shadow: $shadow-soft;
    border: 1px solid $cream-dark;
  }

  &__card {
    &-floral {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    &-label {
      @include font-sans(0.65rem);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: $text-light;
      margin-bottom: 0.75rem;
    }

    &-names {
      @include font-display(1.5rem);
      color: $text-dark;
      font-style: italic;
      margin-bottom: 0.4rem;
    }

    &-date {
      @include font-serif(0.9rem);
      color: $text-mid;
      margin-bottom: 1rem;
    }

    &-divider {
      width: 40px;
      height: 1px;
      background: $blush;
      margin: 0.5rem auto 0.75rem;
    }

    &-venue {
      font-size: 0.78rem;
      color: $text-light;
      font-style: italic;
      margin-bottom: 1rem;
    }

    &-rsvp {
      background: $sage;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 0.5rem 1.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      cursor: pointer;
      @include font-sans(0.75rem, 500);
    }
  }

  &__badge {
    position: absolute;
    bottom: -20px;
    left: -20px;
    background: $white;
    border-radius: $radius-md;
    padding: 0.875rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: $shadow-card;
    animation: float 5s ease-in-out infinite 2.5s;

    &-icon {
      font-size: 1.5rem;
    }

    strong {
      display: block;
      font-size: 0.875rem;
      color: $text-dark;
    }
    span {
      font-size: 0.7rem;
      color: $text-light;
    }
  }

  @include respond-to(lg) {
    &__inner {
      grid-template-columns: 1fr;
      text-align: center;
    }
    &__actions {
      justify-content: center;
    }
    &__stats {
      justify-content: center;
    }
    &__visual {
      margin-top: 2rem;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
</style>