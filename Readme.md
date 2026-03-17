1. Cấu trúc project hoàn chỉnh

leafly-frontend
│
├── assets
│   ├── css
│   │   └── main.css
│   ├── fonts
│   └── images
│
├── components
│   ├── invitation
│   │   ├── InvitationHero.vue
│   │   ├── InvitationStory.vue
│   │   ├── InvitationTimeline.vue
│   │   ├── InvitationGallery.vue
│   │   ├── InvitationLocation.vue
│   │   └── InvitationFooter.vue
│   │
│   ├── rsvp
│   │   ├── RSVPForm.vue
│   │   └── GuestNumber.vue
│   │
│   └── ui
│       ├── Button.vue
│       ├── Input.vue
│       └── Modal.vue
│
├── layouts
│   ├── default.vue
│   └── invitation.vue
│
├── pages
│   ├── index.vue
│   ├── editor.vue
│   └── [slug].vue
│
├── composables
│   ├── useInvitation.ts
│   ├── useRSVP.ts
│   └── useAnimation.ts
│
├── services
│   ├── api.ts
│   └── invitationService.ts
│
├── store
│   └── invitationStore.ts
│
├── templates
│   ├── garden
│   │   ├── Hero.vue
│   │   ├── Story.vue
│   │   └── Gallery.vue
│   │
│   ├── floral
│   │   ├── Hero.vue
│   │   └── Gallery.vue
│   │
│   └── minimal
│       ├── Hero.vue
│       └── Story.vue
│
├── public
│
├── Dockerfile
├── docker-compose.yml
├── nuxt.config.ts
└── package.json