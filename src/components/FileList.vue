<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { FilterNodeMethodFunction, TreeInstance } from 'element-plus'
import { exists, mkdir, readDir, BaseDirectory } from '@tauri-apps/plugin-fs'
import { useDailyStore } from '@/stores/daily'
import AddSvg from './icons/AddSvg.vue'
import CtrlKSvg from './icons/CtrlKSvg.vue'
import DailySvg from './icons/DailySvg.vue'
import DeleteSvg from './icons/DeleteSvg.vue'

interface Tree {
  label: string
  children?: Tree[]
}

const filterText = ref('')
const treeRef = ref<TreeInstance>()

const dailyStore = useDailyStore()
const editorState = dailyStore.editorState

const handleNodeClick = (data: Tree) => {
  editorState.filename = data.label
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

// const data: Tree[] = [
//   {
//     label: "Level one 1",
//     children: [
//       {
//         label: "Level two 1-1",
//         children: [
//           {
//             label: "Level three 1-1-1",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     label: "Level one 2",
//     children: [
//       {
//         label: "Level two 2-1",
//         children: [
//           {
//             label: "Level three 2-1-1",
//           },
//         ],
//       },
//       {
//         label: "Level two 2-2",
//         children: [
//           {
//             label: "Level three 2-2-1",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     label: "Level one 3",
//     children: [
//       {
//         label: "Level two 3-1",
//         children: [
//           {
//             label: "Level three 3-1-1",
//           },
//         ],
//       },
//       {
//         label: "Level two 3-2",
//         children: [
//           {
//             label: "Level three 3-2-1",
//           },
//         ],
//       },
//     ],
//   },
// ];

const data: Ref<Tree[]> = ref([])

const _walkWorkDir = async (dir: string): Promise<Tree[]> => {
  const treeData: Tree[] = []
  const entries = await readDir(dir, { baseDir: BaseDirectory.Document })
  for (const entry of entries) {
    const node: Tree = { label: entry.name }
    if (entry.isDirectory) {
      node.label = entry.name
      node.children = await _walkWorkDir(`${dir}/${entry.name}`)
      treeData.push(node)
    } else if (entry.isFile) {
      // 处理文件逻辑
      node.label = entry.name
      treeData.push(node)
    }
  }
  return treeData
}

const updateWorkDirData = async () => {
  const existsWorkDir = await exists('DailyGPG', {
    baseDir: BaseDirectory.Document,
  })
  if (!existsWorkDir) {
    await mkdir('DailyGPG', { baseDir: BaseDirectory.Document })
  }
  data.value = await _walkWorkDir('DailyGPG')
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const removeNode = (event: MouseEvent, data: Tree) => {
  event.stopPropagation()
  const name = data.label
  console.log('Removing Daily:', name)
}

onMounted(() => {
  // 初始化树形数据
  updateWorkDirData()
})
</script>

<template>
  <el-container class="main">
    <el-main>
      <div class="sticky-bar">
        <div class="create-new">
          <button class="add-button">
            <AddSvg />
            <div>新内容</div>
          </button>
          <CtrlKSvg />
        </div>

        <el-input v-model="filterText" class="filter-input" placeholder="Filter keyword" />
      </div>

      <el-tree
        ref="treeRef"
        :data="data"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="content">
              <DailySvg style="font-size: 10px;" />
              <span>{{ node.label }}</span>
            </div>
            <div>
              <el-button class="remove-button" link @click="removeNode($event, data)">
                <DeleteSvg style="font-size: 10px;" />
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.el-main {
  padding: 10px;
}

.el-main {
  padding-top: 0;

  .sticky-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f3f4f6;
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
    margin-bottom: 16px;

    &:hover,
    &:focus-within {
      background: rgba(0, 87, 255, 0.1);
    }

    .add-button {
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

  .filter-input {
    width: 100%;
    margin-bottom: 12px;
  }

  .el-tree {
    background-color: transparent;

    :deep(.el-tree-node__content) {
      height: 38px;

      &:hover {
        background-color: #e9eaec;
      }
    }
  }
}

.tree-node{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  width: 100%;
  height: 100%;

  .content{
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .remove-button {
    display: none;
  }
}

.tree-node:hover .remove-button {
  display: block;
}
</style>
