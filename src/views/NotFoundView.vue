<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-surface text-center px-4 gap-6">
    <div class="text-[80px] font-mono font-bold text-edge leading-none" aria-hidden="true">404</div>
    <div>
      <h1 class="text-xl font-semibold text-ink">Page not found</h1>
      <p class="text-sm text-muted mt-2">This page doesn't exist.</p>
    </div>
    <div class="flex gap-3">
      <RouterLink
        to="/"
        class="h-9 px-5 bg-primary text-white text-sm font-medium rounded-sm flex items-center transition-colors hover:bg-primary-hover no-underline"
      >
        ← Home
      </RouterLink>
      <RouterLink
        to="/app"
        class="h-9 px-5 border border-edge text-ink text-sm font-medium rounded-sm flex items-center transition-colors hover:border-primary hover:text-primary no-underline"
      >
        Open Designer
      </RouterLink>
    </div>
  </div>
</template>
