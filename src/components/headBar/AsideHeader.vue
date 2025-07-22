<script setup lang="ts">
const emit = defineEmits(["toggle-aside"]);
</script>

<template>
  <div class="header-wrapper">
    <div class="logo-wrapper pywebview-drag-region">
      <h3 class="">Editor</h3>
    </div>

    <div class="action" @click="$emit('toggle-aside')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M21 5H11v14h10zM3 5h6v14H3zm0-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm2 4.25a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5zm-.75 3.5A.75.75 0 0 1 5 10h2a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75m.75 2a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5z"
          clip-rule="evenodd"
        ></path>
      </svg>
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
