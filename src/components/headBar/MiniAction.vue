<script setup lang="ts">
const props = defineProps<{
  showPinAside: boolean;
  narrowWindow: boolean;
}>();

const emit = defineEmits(["toggle-aside"]);
</script>
<template>
  <div class="mini-action" v-if="!showPinAside || narrowWindow">
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

    <div class="create-new">
      <button class="add-button action">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2a1 1 0 0 0-1 1v8H3a1 1 0 1 0 0 2h8v8a1 1 0 1 0 2 0v-8h8a1 1 0 1 0 0-2h-8V3a1 1 0 0 0-1-1"
          ></path>
        </svg>
        <div>新内容</div>
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.mini-action {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 8px;

  padding-right: 8px;
  padding-left: 10px;
  border-right: 1px solid #e0e1e3;

  .action {
    font-size: 20px;
    svg {
      width: 1em;
      height: 1em;
      fill: none;
    }
  }
}

.create-new {
  align-items: center;
  background: rgba(0, 87, 255, 0.06);
  border: 0.5px solid rgba(0, 102, 255, 0.15);
  cursor: pointer;
  display: inline-flex;
  justify-content: space-between;
  padding: 8px 6px;
  width: 100%;
  border-radius: 12px;
  color: #0057ff;
  border: 0.8 px solid rgba(0, 87, 255, 0.15);

  &:hover,
  &:focus-within {
    background: rgba(0, 87, 255, 0.1);
  }

  .add-button,
  .save-button {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;

    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;

    font-size: 14px;
    font-weight: 600;
    color: #0057ff;
    line-height: 22px;
    align-items: center;

    div {
      font-size: 14px;
      font-weight: 600;
      color: #0057ff;
      line-height: 22px;
      align-items: center;
    }
  }
}
</style>
