<script lang="ts" setup>
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted } from 'vue';

let appWindow: Awaited<ReturnType<typeof getCurrentWindow>>;

onMounted(async () => {
  appWindow = await getCurrentWindow();
});

const windowCloseClick = () => {
  appWindow.close();
};

const windowMinimizeClick = () => {
  appWindow.minimize();
};

const windowMaximizeToggle = () => {
  appWindow.toggleMaximize();
};
</script>

<template>
  <div class="system-buttons-mac">
    <div class="mac-btn close action" title="关闭" @click="windowCloseClick"></div>
    <div
      class="mac-btn minimize action"
      title="最小化"
      @click="windowMinimizeClick"
    ></div>
    <div
      class="mac-btn maximize action"
      title="最大化"
      @click="windowMaximizeToggle"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.system-buttons-mac {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 15px;
  margin-right: 10px;
  .mac-btn {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid #e0e0e0;
    box-sizing: border-box;
    cursor: pointer;
    transition: box-shadow 0.2s;
    &.close {
      background: #ff5f57;
      border-color: #e0483e;
    }
    &.minimize {
      background: #ffbd2e;
      border-color: #dfa123;
    }
    &.maximize {
      background: #28c940;
      border-color: #1aab29;
    }
    &:hover {
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
