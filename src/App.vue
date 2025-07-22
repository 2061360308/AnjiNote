<script lang="ts" setup>
import { onMounted, ref, Ref, computed, watch, markRaw, h, provide, reactive } from "vue";
import Editor from "./components/Editor.vue";
import FileList from "./components/FileList.vue";
import HeaderBar from "./components/HeaderBar.vue";
import DailyTitle from "./components/headBar/DailyTitle.vue";
import MiniAction from "./components/headBar/MiniAction.vue";
import SaveButton from "./components/headBar/SaveButton.vue";
import AsideHeader from "./components/headBar/AsideHeader.vue";

import GuidedConfiguration from "./components/GuidedConfiguration.vue";

import * as globalProvide from "./globalProvide";
import { LazyStore } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

// Store 会在 JavaScript 绑定时自动加载。
const store = new LazyStore(".store/settings.json");

Object.entries(globalProvide).forEach(([key, val]) => {
  provide(key, val);
});

// 记录当前编辑器状态
const editorSate = reactive({
  filename: `${new Date().toISOString().slice(0, 10)}.daily`,  // 当前编辑打开的文件名,默认应该打开当前日期
  editorIsReady: false,  // 编辑器是否准备就绪
  saveFile: () => {},  // 保存文件的函数
});

provide("editorSate", editorSate);

// Extend the Window interface to include the 'python' property
declare global {
  interface Window {
    pywebview: {
      api: { [key: string]: any };
    };
  }
}

const showPinAside: Ref<boolean> = ref(true);
const showDrawerAside: Ref<boolean> = ref(false);
const narrowWindow: Ref<boolean> = ref(false);

const headerRef = ref();

const dialogFormVisible = ref(false);

const input = ref("");

const guidPageVisible = ref(false);

const checkMiniAction = () => {
  const Mini_Action_KEY = "MINI_ACTION";
  const miniActionInstance = h(MiniAction, {
    showPinAside: showPinAside.value,
    narrowWindow: narrowWindow.value,
    key: Mini_Action_KEY,
    onToggleAside: headerToggleAside,
  });
  const removeMiniAction = () => {
    const index = headerRef.value.leftComponent.findIndex(
      (v) => v.key === Mini_Action_KEY
    );
    if (index > -1) {
      headerRef.value.leftComponent.splice(index, 1);
    }
  };

  const addMiniAction = () => {
    if (!headerRef.value.leftComponent.some((v) => v.key === Mini_Action_KEY)) {
      headerRef.value.leftComponent.unshift(markRaw(miniActionInstance));
    }
  };
  if (narrowWindow.value) {
    // 如果是窄窗口，显示 MiniAction
    addMiniAction();
  } else {
    // 如果是宽窗口且固定侧边栏，移除 MiniAction
    if (showPinAside.value) {
      removeMiniAction();
    } else {
      // 如果是宽窗口且未固定侧边栏，显示 MiniAction
      addMiniAction();
    }
  }
};

const checkAsideHeader = () => {
  const ASIDE_HEADER_KEY = "ASIDE_HEADER";
  const asideHeaderInstance = h(AsideHeader, {
    onToggleAside: asideToggle,
    key: ASIDE_HEADER_KEY,
  });
  if (showPinAside.value && !narrowWindow.value) {
    // 如果固定侧边栏，显示 AsideHeader

    console.log("showAsideHeader");
    if (
      !headerRef.value.leftComponent.some((v) => v.key === ASIDE_HEADER_KEY)
    ) {
      headerRef.value.leftComponent.unshift(markRaw(asideHeaderInstance));
    }
  } else {
    // 如果未固定侧边栏，移除 AsideHeader
    const index = headerRef.value.leftComponent.findIndex(
      (v) => v.key === ASIDE_HEADER_KEY
    );
    if (index > -1) {
      headerRef.value.leftComponent.splice(index, 1);
    }
  }
};

const loadMainHeaderItems = () => {
  headerRef.value.leftComponent = [];
  headerRef.value.rightComponent = [];

  // 加载左侧组件
  checkMiniAction();
  checkAsideHeader();
  headerRef.value.leftComponent.push(
    markRaw(
      h(DailyTitle, {
        onClickEditDailyTitle: () => {
          dialogFormVisible.value = true;
        },
      })
    )
  );
  headerRef.value.rightComponent.push(markRaw(SaveButton));
};

const loadguidPageHeaderItems = () => {
  headerRef.value.leftComponent = [];
  headerRef.value.rightComponent = [];

  // 加载引导配置页面的组件
  headerRef.value.leftComponent.push(markRaw(DailyTitle));
};

const headerToggleAside = () => {
  if (narrowWindow.value) {
    showPinAside.value = false;
    showDrawerAside.value = !showDrawerAside.value;
  } else {
    showDrawerAside.value = false;
    showPinAside.value = !showPinAside.value;
  }

  checkMiniAction();
  checkAsideHeader();
};

const asideToggle = () => {
  showPinAside.value = !showPinAside.value;
  showDrawerAside.value = !showDrawerAside.value;

  checkMiniAction();
  checkAsideHeader();
};

const drawerVisible = computed({
  get() {
    return showDrawerAside.value && narrowWindow.value;
  },
  set(value: boolean) {
    showDrawerAside.value = value;
  },
});

const handleCloseGuide = () => {
  guidPageVisible.value = false;
};

const environmentCheck = async () => {
  // 检查环境配置是否完整
  // const isInstalled = await globalProvide.gpg.checkGpgInstalled();
  const isInstalled = await invoke("check_gpg_installed");
  console.log("GPG 安装状态：", isInstalled);

  // 检查recipient值是否配置
  const recipient = await store.get("recipient");
  if (!isInstalled || !recipient) {
    guidPageVisible.value = true;
  }
};

onMounted(() => {
  // 页面宽度小于1000时自动隐藏侧边栏
  const checkWidth = () => {
    narrowWindow.value = window.innerWidth <= 1100;

    checkMiniAction();
    checkAsideHeader();
  };
  checkWidth();
  window.addEventListener("resize", checkWidth);

  checkAsideHeader();

  environmentCheck();

  watch(
    () => guidPageVisible.value,
    (newValue) => {
      if (newValue) {
        loadguidPageHeaderItems();
      } else {
        loadMainHeaderItems();
      }
    },
    { immediate: true }
  );
});
</script>

<template>
  <el-container class="main">
    <el-header>
      <HeaderBar
        :show-pin-aside="showPinAside"
        :narrow-window="narrowWindow"
        @click-edit-daily-title="dialogFormVisible = true"
        @toggle-aside="headerToggleAside"
        ref="headerRef"
      />
    </el-header>
    <el-container class="worker-container">
      <el-aside
        class="file-list"
        width="280px"
        v-show="showPinAside && !narrowWindow"
      >
        <FileList />
      </el-aside>
      <el-main v-if="!guidPageVisible">
        <Editor />
      </el-main>
      <GuidedConfiguration
        @close-guided-configuration="handleCloseGuide"
        v-else
      />
      <el-drawer
        class="drawer-aside"
        v-model="drawerVisible"
        :with-header="false"
        :direction="'ltr'"
        size="300px"
      >
        <AsideHeader @toggle-aside="asideToggle" />
        <FileList />
      </el-drawer>
    </el-container>
    <!-- <el-aside class="file-list" width="280px">Aside</el-aside> -->
  </el-container>

  <el-dialog
    v-model="dialogFormVisible"
    title="编辑日记名称"
    style="max-width: 500px; width: 30%; min-width: 300px"
    align-center
  >
    <el-input v-model="input" placeholder="Please input" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
  .file-list,
  :deep(.drawer-aside) {
    background-color: #f3f4f6;
  }

  .el-header {
    padding: 0;
  }

  .worker-container {
    height: calc(100vh - 60px);
    background-color: #fff;

    .el-main {
      padding-top: 0;
      padding-right: 0;
    }
  }
}

.drawer-aside {
  height: 100%;
  outline: none;
}

:deep(.drawer-aside) {
  outline: none;

  .header-wrapper,
  .el-container .el-main {
    outline: none;
  }

  .el-container {
    height: calc(100% - 60px);
  }

  .el-drawer__body {
    padding: 0 10px;
  }
}
</style>
