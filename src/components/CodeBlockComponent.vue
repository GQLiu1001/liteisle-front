<template>
  <node-view-wrapper class="code-block-wrapper relative" spellcheck="false">
    <div :class="['language-selector absolute bottom-2 right-2 z-[1] transition-opacity', selectedLanguage ? 'opacity-50 hover:opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100']">
      <input
        type="text"
        v-model="selectedLanguage"
        :placeholder="placeholder"
        :style="{ width: `${inputSize}ch`, textAlign: 'right' }"
        class="bg-transparent text-gray-500 text-xs rounded-md py-1 border border-transparent hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all duration-200"
        @focus="($event.target as HTMLInputElement)?.select()"
      />
    </div>
    <pre><node-view-content as="code" class="group" /></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const placeholder = 'language';

const selectedLanguage = computed({
  get() {
    return props.node.attrs.language || '';
  },
  set(language) {
    props.updateAttributes({ language: language || null });
  },
});

const inputSize = computed(() => {
  const langLength = selectedLanguage.value.length;
  const placeholderLength = placeholder.length;
  // Use the length of the content or placeholder, whichever is longer, and add a small buffer.
  return Math.max(langLength, placeholderLength) + 2;
});
</script> 