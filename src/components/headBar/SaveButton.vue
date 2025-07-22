<script setup lang="ts">
import { defineComponent, inject } from "vue";

const editorSate = inject("editorSate");
</script>

<template>
  <div class="save-action" @click="editorSate.saveFile()">
    <button class="save-button">
      <svg
        t="1752873617947"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4482"
        width="1em"
        height="1em"
      >
        <path
          d="M819.823 83.694H206.991c-67.703 0-122.588 54.885-122.588 122.588v612.833c0 67.703 54.885 122.588 122.588 122.588h612.833c67.703 0 122.588-54.885 122.588-122.588V206.282c-0.001-67.703-54.885-122.588-122.589-122.588z m-124.435 63.313v241.142H331.772V147.007h363.616z m185.787 672.274c0.027 33.765-27.323 61.158-61.088 61.185H207.133c-16.389 0-31.864-6.297-43.454-17.887s-18.039-26.91-18.039-43.298v-612.94c0.061-33.923 27.57-61.395 61.493-61.41h61.327v245.294c-0.05 33.771 27.286 61.187 61.057 61.237h367.888c33.853 0 61.299-27.387 61.299-61.237V144.931h61.206c33.872 0.036 61.301 27.524 61.265 61.396V819.281z"
          fill="currentColor"
          p-id="4483"
        ></path>
        <path
          d="M574.817 329.936c17.483 0 31.656-14.173 31.656-31.656v-61.292c0-17.483-14.173-31.656-31.656-31.656s-31.656 14.173-31.656 31.656v61.292c0 17.483 14.173 31.656 31.656 31.656z"
          fill="currentColor"
          p-id="4484"
        ></path>
      </svg>
      <div>保存内容</div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.save-action {
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
