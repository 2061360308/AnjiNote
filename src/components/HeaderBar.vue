<script setup lang="ts">
import { ref } from "vue";
import type { Ref,VNode, Component } from 'vue'
import SystemButton from "./SystemButton.vue";

const leftComponent: Ref<Array<VNode | Component>> = ref([]);
const rightComponent: Ref<Array<VNode | Component>> = ref([]);

// 暴露组件属性
defineExpose({
  leftComponent,
  rightComponent,
});
</script>

<template>
  <div data-tauri-drag-region class="header-wrapper-outer pywebview-drag-region">
    <div class="header-wrapper header-wrapper-left">
      <!-- 遍历显示 leftComponent 中的组件 -->
      <component
        v-for="(component, index) in leftComponent"
        :key="index"
        :is="component"
      />
    </div>
    <div class="header-wrapper header-wrapper-right">
      <!-- 遍历显示 rightComponent 中的组件 -->
      <component
        v-for="(component, index) in rightComponent"
        :key="index"
        :is="component"
      />
      <SystemButton />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-wrapper-outer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  gap: 8px;
}

.header-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 8px;
  padding: 0;

  .header-wrapper-left {
    flex: 1;
  }
}
</style>
