<script setup lang="ts">
import type { Product, ProductColor } from '@/data/catalog'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'design-now', product: Product, color: ProductColor): void
  (e: 'see-details', product: Product): void
}>()

const handleDesignNow = () => {
  emit('design-now', props.product, props.product.colors[0])
}
</script>

<template>
  <!-- Mobile Product Card with Desktop-Adapted Hover, Zoom, and Tactile Transitions -->
  <div class="flex-none w-[200px] flex flex-col gap-3.5 select-none font-['Stanley_Favorit',sans-serif] group transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1" data-node-id="5217:1999">
    <!-- 1. Product Image Container with Gradient Background (Shadow on card applied, thumbnail shadow removed) -->
    <div
      @click="emit('see-details', product)"
      class="relative w-[200px] h-[267px] rounded-lg overflow-hidden cursor-pointer shadow-sm group-hover:shadow-md active:scale-[0.98] transition-all duration-300 flex-none flex items-center justify-center p-3"
      :style="{
        background: `linear-gradient(to bottom, ${product.gradientFrom}, ${product.gradientTo})`
      }"
      data-node-id="5217:2000"
    >
      <!-- Tumbler Image (Clean thumbnail without floor shadow + smooth zoom) -->
      <img
        :src="product.defaultImage"
        :alt="product.name"
        class="w-full h-full object-contain p-1 transition-transform duration-500 ease-out transform-gpu will-change-transform group-hover:scale-105 group-active:scale-105 pointer-events-none"
        data-node-id="5217:2003"
      />
    </div>

    <!-- 2. Color Swatches Bar (Identical mechanism to desktop: clean static visual row, unclickable, no O-ring) -->
    <div
      class="w-[200px] h-7 flex items-center justify-start gap-2 overflow-hidden py-1 px-1 select-none pointer-events-none flex-none"
      data-node-id="5217:2004"
    >
      <div
        v-for="col in product.colors.slice(0, 7)"
        :key="col.name"
        :title="col.name"
        class="w-4 h-4 rounded-full flex-none transition-transform duration-200"
        :style="{ backgroundColor: col.hex }"
      ></div>
    </div>

    <!-- 3. Product Details (Matching Desktop typography & Figma) -->
    <div class="flex flex-col gap-2 text-black flex-none" data-node-id="5217:2012">
      <h3
        @click="emit('see-details', product)"
        class="font-bold text-[15px] sm:text-[16px] leading-snug cursor-pointer hover:underline line-clamp-2 min-h-[42px] transition-colors duration-150"
        data-node-id="5217:2013"
      >
        {{ product.name }}
      </h3>

      <p
        class="font-light text-[13px] text-neutral-600 leading-snug line-clamp-2 min-h-[34px]"
        data-node-id="5217:2014"
      >
        {{ product.description }}
      </p>

      <div class="font-light text-[14px] text-black" data-node-id="5217:2015">
        {{ product.priceFormatted }}
      </div>
    </div>

    <!-- 4. Product Actions (CTA Button 107px x 48px + See Details) -->
    <div class="flex items-center justify-between w-[200px] mt-auto pt-1 flex-none" data-node-id="5217:2016">
      <button
        @click="handleDesignNow"
        class="w-[107px] h-12 border border-black bg-transparent hover:bg-black text-black hover:text-white rounded-[4px] font-medium text-[12px] tracking-normal transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xs hover:shadow-md active:scale-95 btn-shimmer transform-gpu select-none"
        data-node-id="5217:2017"
      >
        Design Now
      </button>

      <button
        @click="emit('see-details', product)"
        class="flex-1 text-center font-normal text-[12px] text-neutral-800 hover:text-black underline underline-offset-2 decoration-neutral-300 hover:decoration-black hover:translate-x-0.5 active:scale-95 transition-all duration-200 cursor-pointer select-none"
        data-node-id="5217:2018"
      >
        See Details
      </button>
    </div>
  </div>
</template>
