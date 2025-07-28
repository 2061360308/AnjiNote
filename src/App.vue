<script lang="ts" setup>
import { onMounted, ref, computed, watch, markRaw, h, provide, reactive } from 'vue'
import type { VNode, Component } from 'vue'
import Editor from './components/Editor.vue'
import FileList from './components/FileList.vue'
import HeaderBar from './components/HeaderBar.vue'
import GuidedConfiguration from './components/GuidedConfiguration.vue'
import { LazyStore } from '@tauri-apps/plugin-store'
import { invoke } from '@tauri-apps/api/core'

import DailyTitle from './components/headBar/DailyTitle.vue'
import MiniAction from './components/headBar/MiniAction.vue'
import SaveButton from './components/headBar/SaveButton.vue'
import AsideHeader from './components/headBar/AsideHeader.vue'

// HeaderBar 组件实例类型（根据你的实际组件结构调整）
interface HeaderBarInstance {
  leftComponent: Array<VNode | Component>
  rightComponent: Array<VNode | Component>
}

const store = new LazyStore('.store/settings.json')

const showPinAside = ref<boolean>(true)
const narrowWindow = ref<boolean>(false)
const showDrawerAside = ref<boolean>(false)

const drawerVisible = computed<boolean>({
  get() {
    return showDrawerAside.value && narrowWindow.value
  },
  set(value: boolean) {
    showDrawerAside.value = value
  },
})

const headerRef = ref<HeaderBarInstance | null>(null)
const dialogFormVisible = ref<boolean>(false)
const input = ref<string>('')
const guidPageVisible = ref<boolean>(false)

// 标题栏组件装配逻辑
const checkMiniAction = (): void => {
  if (!headerRef.value) return
  const Mini_Action_KEY = 'MINI_ACTION'
  const miniActionInstance = h(MiniAction, {
    showPinAside: showPinAside.value,
    narrowWindow: narrowWindow.value,
    key: Mini_Action_KEY,
    onToggleAside: headerToggleAside,
  })
  const removeMiniAction = () => {
    const index = headerRef.value!.leftComponent.findIndex(
      (v) => (v as VNode).key === Mini_Action_KEY,
    )
    if (index > -1) {
      headerRef.value!.leftComponent.splice(index, 1)
    }
  }

  const addMiniAction = () => {
    if (!headerRef.value!.leftComponent.some((v) => (v as VNode).key === Mini_Action_KEY)) {
      headerRef.value!.leftComponent.unshift(markRaw(miniActionInstance))
    }
  }
  if (narrowWindow.value) {
    addMiniAction()
  } else {
    if (showPinAside.value) {
      removeMiniAction()
    } else {
      addMiniAction()
    }
  }
}

const checkAsideHeader = (): void => {
  if (!headerRef.value) return
  const ASIDE_HEADER_KEY = 'ASIDE_HEADER'
  const asideHeaderInstance = h(AsideHeader, {
    onToggleAside: asideToggle,
    key: ASIDE_HEADER_KEY,
  })
  if (showPinAside.value && !narrowWindow.value) {
    if (!headerRef.value.leftComponent.some((v) => (v as VNode).key === ASIDE_HEADER_KEY)) {
      headerRef.value.leftComponent.unshift(markRaw(asideHeaderInstance))
    }
  } else {
    const index = headerRef.value.leftComponent.findIndex(
      (v) => (v as VNode).key === ASIDE_HEADER_KEY,
    )
    if (index > -1) {
      headerRef.value.leftComponent.splice(index, 1)
    }
  }
}

const loadMainHeaderItems = (): void => {
  if (!headerRef.value) return
  headerRef.value.leftComponent = []
  headerRef.value.rightComponent = []

  checkMiniAction()
  checkAsideHeader()
  headerRef.value.leftComponent.push(
    markRaw(
      h(DailyTitle, {
        onClickEditDailyTitle: () => {
          dialogFormVisible.value = true
        },
      }),
    ),
  )
  headerRef.value.rightComponent.push(markRaw(SaveButton))
}

const loadguidPageHeaderItems = (): void => {
  if (!headerRef.value) return
  headerRef.value.leftComponent = []
  headerRef.value.rightComponent = []
  headerRef.value.leftComponent.push(markRaw(DailyTitle))
}

const headerToggleAside = (): void => {
  if (narrowWindow.value) {
    showPinAside.value = false
    showDrawerAside.value = !showDrawerAside.value
  } else {
    showDrawerAside.value = false
    showPinAside.value = !showPinAside.value
  }
  checkMiniAction()
  checkAsideHeader()
}

const asideToggle = (): void => {
  showPinAside.value = !showPinAside.value
  showDrawerAside.value = !showDrawerAside.value
  checkMiniAction()
  checkAsideHeader()
}

const handleCloseGuide = (): void => {
  guidPageVisible.value = false
}

const environmentCheck = async (): Promise<void> => {
  const isInstalled = await invoke<boolean>('check_gpg_installed')
  console.log('GPG 安装状态：', isInstalled)
  const recipient = await store.get('recipient')
  if (!isInstalled || !recipient) {
    guidPageVisible.value = true
  }
}

onMounted(() => {
  const checkWidth = () => {
    narrowWindow.value = window.innerWidth <= 1100
    checkMiniAction()
    checkAsideHeader()
  }
  checkWidth()
  window.addEventListener('resize', checkWidth)
  checkAsideHeader()
  environmentCheck()
  watch(
    () => guidPageVisible.value,
    (newValue) => {
      if (newValue) {
        loadguidPageHeaderItems()
      } else {
        loadMainHeaderItems()
      }
    },
    { immediate: true },
  )
})
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
      <el-aside class="file-list" width="280px" v-show="showPinAside && !narrowWindow">
        <FileList />
      </el-aside>
      <el-main v-if="!guidPageVisible">
        <Editor />
      </el-main>
      <GuidedConfiguration @close-guided-configuration="handleCloseGuide" v-else />
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
        <el-button type="primary" @click="dialogFormVisible = false"> 确认 </el-button>
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
