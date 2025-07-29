<script setup lang="ts">
import ToggleMenuSvg from '../icons/ToggleMenuSvg.vue';
const emit = defineEmits(["toggle-aside"]);
</script>

<template>
  <div class="header-wrapper">
    <div class="logo-wrapper pywebview-drag-region">
      <h3 class="">Editor</h3>
    </div>

    <div class="action" @click="$emit('toggle-aside')">
      <ToggleMenuSvg />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.el-header {
  padding: 10px;
}

.header-wrapper {
  width: 280px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: #f3f4f6;
  outline: 1px solid #e0e1e3;

  .logo-wrapper {
    flex: 1;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }
  }

  .action {
    font-size: 20px;
    svg {
      width: 1em;
      height: 1em;
      fill: none;
    }
  }
}
</style>
