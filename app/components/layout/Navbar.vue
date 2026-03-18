<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="container navbar__inner">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo">
        <span class="navbar__logo-leaf">🌿</span>
        <span class="navbar__logo-text">Leafly</span>
      </NuxtLink>

      <!-- Nav links -->
      <nav class="navbar__links" :class="{ 'navbar__links--open': menuOpen }">
        <NuxtLink to="/" class="navbar__link">Home</NuxtLink>
        <NuxtLink to="/templates" class="navbar__link">Templates</NuxtLink>
        <NuxtLink to="/pricing" class="navbar__link">Pricing</NuxtLink>
        <NuxtLink to="/contact" class="navbar__link">Contact</NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="navbar__actions">
        <NuxtLink to="/login" class="btn btn-outline btn--sm">Log in</NuxtLink>
        <NuxtLink to="/signup" class="btn btn-primary btn--sm">Sign up</NuxtLink>
      </div>

      <!-- Hamburger -->
      <button
        class="navbar__hamburger"
        @click="menuOpen = !menuOpen"
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<script setup>
const isScrolled = ref(false)
const menuOpen = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 40
  })
})
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.25rem 0;
  transition: all 0.35s ease;

  &--scrolled {
    backdrop-filter: blur(12px);
    padding: 0.75rem 0;
    box-shadow: 0 2px 20px rgba($text-dark, 0.08);
  }

  &__inner {
    @include flex-between;
    gap: 2rem;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
    @include font-display(1.5rem, 600);
    color: $text-dark;
    letter-spacing: -0.02em;
    flex-shrink: 0;

    &-leaf { font-size: 1.2rem; }
  }

  &__links {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-left: auto;
  }

  &__link {
    @include font-sans(0.9rem);
    color: $text-mid;
    text-decoration: none;
    transition: color 0.2s;
    letter-spacing: 0.02em;

    &:hover,
    &.router-link-active {
      color: $sage;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: 1rem;
  }

  &__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-left: auto;

    span {
      display: block;
      width: 22px;
      height: 2px;
      background: $text-dark;
      border-radius: 2px;
      transition: all 0.3s;
    }
  }

  // --- Mobile ---
  @include respond-to(md) {
    &__links {
      // Ẩn mặc định trên mobile
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      background: $cream;
      padding: 1.5rem;
      gap: 1.25rem;
      border-bottom: 1px solid $cream-dark;
      align-items: flex-start;

      // Hiện khi có class --open
      &--open {
        display: flex;
      }
    }

    &__actions { display: none; }

    &__hamburger { display: flex; }
  }
}
</style>