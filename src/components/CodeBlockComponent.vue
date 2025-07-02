<template>
  <node-view-wrapper class="code-block-wrapper relative" spellcheck="false">
    <div class="language-selector absolute bottom-2 right-2 z-10">
      <input
        type="text"
        v-model="selectedLanguage"
        contenteditable="true"
        :placeholder="placeholder"
        :style="{ width: `${inputSize}ch`, textAlign: 'right' }"
        class="bg-transparent text-gray-500 text-xs rounded-md py-1 border border-transparent focus:outline-none transition-colors"
      />
    </div>
    <pre><node-view-content as="code" /></pre>
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
  return Math.max(langLength, placeholderLength) + 1;
});
</script> 