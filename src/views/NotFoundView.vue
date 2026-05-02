<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#ecf3f4] text-center px-4 gap-6">
    <div class="text-[80px] font-mono font-bold text-[#d0dde0] leading-none" aria-hidden="true">404</div>
    <div>
      <h1 class="text-xl font-semibold text-[#222]">Page not found</h1>
      <p class="text-sm text-[#5d5d5d] mt-2">This page doesn't exist.</p>
    </div>
    <div class="flex gap-3">
      <RouterLink
        to="/"
        class="h-9 px-5 bg-[#0cacd7] text-white text-sm font-medium rounded-sm flex items-center transition-colors hover:bg-[#0a9bbf] no-underline"
      >
        ← Home
      </RouterLink>
      <RouterLink
        to="/app"
        class="h-9 px-5 border border-[#d0dde0] text-[#222] text-sm font-medium rounded-sm flex items-center transition-colors hover:border-[#0cacd7] hover:text-[#0cacd7] no-underline"
      >
        Open Designer
      </RouterLink>
    </div>
  </div>
</template>
