<template>
  <main class="bg-[#E2DFC4] min-h-screen flex flex-col">
    <header class="bg-[#E2DFC4] w-full py-2 mb-4 flex justify-left">
      <img
        src="~/public/system_banner.png"
        alt="System Banner"
        class="w-1/6 ml-2 mt-2 h-auto"
      >
    </header>
    <slot />
  </main>
</template>
