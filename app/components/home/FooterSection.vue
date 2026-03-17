<template>
  <footer class="footer">
    <div class="container footer__inner">
      <!-- Brand -->
      <div class="footer__brand">
        <div class="footer__logo">🌿 Leafly</div>
        <p class="footer__tagline">
          Beautiful wedding invitations, shared with love.
        </p>
        <div class="footer__socials">
          <a href="#" class="footer__social" aria-label="Instagram">📸</a>
          <a href="#" class="footer__social" aria-label="Pinterest">📌</a>
          <a href="#" class="footer__social" aria-label="Facebook">👥</a>
          <a href="#" class="footer__social" aria-label="Twitter">🐦</a>
        </div>
      </div>

      <!-- Columns -->
      <div class="footer__col">
        <h4 class="footer__col-title">Product</h4>
        <nav class="footer__links">
          <NuxtLink to="/templates" class="footer__link">Templates</NuxtLink>
          <NuxtLink to="/features" class="footer__link"
            >Ndisconnecting</NuxtLink
          >
          <NuxtLink to="/rsvp" class="footer__link">Roons</NuxtLink>
          <NuxtLink to="/rsvp" class="footer__link">RSVP Gurvio</NuxtLink>
        </nav>
      </div>

      <div class="footer__col">
        <h4 class="footer__col-title">Templates</h4>
        <nav class="footer__links">
          <NuxtLink to="/templates?style=pending" class="footer__link"
            >Pendings</NuxtLink
          >
          <NuxtLink to="/templates?style=premium" class="footer__link"
            >Premiummos</NuxtLink
          >
          <NuxtLink to="/templates?style=handmade" class="footer__link"
            >Handmade</NuxtLink
          >
        </nav>
      </div>

      <div class="footer__col">
        <h4 class="footer__col-title">Pricing</h4>
        <nav class="footer__links">
          <NuxtLink to="/pricing" class="footer__link">Ramorsors</NuxtLink>
          <NuxtLink to="/pricing" class="footer__link">Momsnormos</NuxtLink>
        </nav>
      </div>

      <div class="footer__col">
        <h4 class="footer__col-title">Help Center</h4>
        <nav class="footer__links">
          <NuxtLink to="/contact" class="footer__link">Contact</NuxtLink>
          <NuxtLink to="/faq" class="footer__link">FAQ</NuxtLink>
        </nav>
      </div>

      <div class="footer__col">
        <h4 class="footer__col-title">Social links</h4>
        <nav class="footer__links">
          <a href="#" class="footer__link">📷 Instagram</a>
          <a href="#" class="footer__link">📌 Pinterest</a>
          <a href="#" class="footer__link">👥 Facebook</a>
          <a href="#" class="footer__link">🐦 Twitter</a>
        </nav>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p class="footer__copy">© Copyright Google | Handmade paper</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $text-dark;
  color: $cream-dark;
  padding-top: 4rem;

  &__inner {
    display: grid;
    grid-template-columns: 2fr repeat(5, 1fr);
    gap: 2rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba($white, 0.08);
  }

  &__logo {
    @include font-display(1.4rem, 600);
    color: $cream;
    margin-bottom: 0.75rem;
  }

  &__tagline {
    @include font-serif(0.875rem);
    font-style: italic;
    color: $text-light;
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }

  &__socials {
    display: flex;
    gap: 0.75rem;
  }

  &__social {
    font-size: 1rem;
    text-decoration: none;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.2);
    }
  }

  &__col-title {
    @include font-sans(0.75rem, 600);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $cream;
    margin-bottom: 1rem;
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__link {
    font-size: 0.8rem;
    color: $text-light;
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: $cream;
    }
  }

  &__bottom {
    padding: 1.25rem 0;

    &-inner {
      @include flex-center;
    }
  }

  &__copy {
    font-size: 0.75rem;
    color: $text-light;
  }

  @media (max-width: 900px) {
    &__inner {
      grid-template-columns: 1fr 1fr 1fr;
    }
    &__brand {
      grid-column: 1 / -1;
    }
  }

  @include respond-to(sm) {
    &__inner {
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>