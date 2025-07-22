<script lang="ts" setup>
import { ref, watch, Ref, onMounted, inject } from "vue";
import type { FilterNodeMethodFunction, TreeInstance } from "element-plus";
import {
  exists,
  mkdir,
  readDir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

interface Tree {
  label: string;
  children?: Tree[];
}

const filterText = ref("");
const treeRef = ref<TreeInstance>();

const editorSate = inject("editorSate");

const handleNodeClick = (data: Tree) => {
  editorSate.filename = data.label;
};

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};

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

const data: Ref<Tree[]> = ref([]);

const _walkWorkDir = async (dir: string): Promise<Tree[]> => {
  const treeData: Tree[] = [];
  const entries = await readDir(dir, { baseDir: BaseDirectory.Document });
  for (const entry of entries) {
    const node: Tree = { label: entry.name };
    if (entry.isDirectory) {
      node.label = entry.name;
      node.children = await _walkWorkDir(`${dir}/${entry.name}`);
      treeData.push(node);
    } else if (entry.isFile) {
      // 处理文件逻辑
      node.label = entry.name;
      treeData.push(node);
    }
  }
  return treeData;
};

const updateWorkDirData = async () => {
  const existsWorkDir = await exists("DailyGPG", {
    baseDir: BaseDirectory.Document,
  });
  if (!existsWorkDir) {
    await mkdir("DailyGPG", { baseDir: BaseDirectory.Document });
  }
  data.value = await _walkWorkDir("DailyGPG");
};

const defaultProps = {
  children: "children",
  label: "label",
};

onMounted(() => {
  // 初始化树形数据
  updateWorkDirData();
});
</script>

<template>
  <el-container class="main">
    <el-main>
      <div class="sticky-bar">
        <div class="create-new">
          <button class="add-button">
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="37"
            height="14"
            fill="none"
            viewBox="0 0 37 14"
            class="short-cut-h4NtnU"
          >
            <rect
              width="22.3"
              height="12.3"
              x="0.35"
              y="0.85"
              stroke="currentColor"
              stroke-width="0.7"
              rx="1.65"
            ></rect>
            <path
              fill="currentColor"
              d="M6.97 10.666c-1.913 0-3.11-1.416-3.11-3.682v-.01c0-2.27 1.192-3.686 3.106-3.686 1.484 0 2.642.933 2.852 2.285l-.005.01h-.884l-.005-.01C8.69 4.67 7.938 4.1 6.966 4.1c-1.353 0-2.202 1.113-2.202 2.876v.01c0 1.762.85 2.87 2.207 2.87.981 0 1.728-.502 1.948-1.313l.01-.01h.889v.01c-.235 1.289-1.348 2.124-2.847 2.124m5.885-.127c-1.084 0-1.538-.4-1.538-1.406V5.939h-.83v-.703h.83V3.874h.879v1.362h1.152v.703h-1.152v2.979c0 .62.215.87.761.87.152 0 .235-.006.391-.02v.722c-.166.03-.327.05-.493.05m1.563-.039V5.236h.85v.782h.077c.2-.552.694-.874 1.407-.874.16 0 .341.02.424.034v.825a3 3 0 0 0-.522-.049c-.81 0-1.387.513-1.387 1.284V10.5zm3.657 0V3.146h.85V10.5z"
            ></path>
            <rect
              width="12.3"
              height="12.3"
              x="24.35"
              y="0.85"
              stroke="currentColor"
              stroke-width="0.7"
              rx="1.65"
            ></rect>
            <path
              fill="currentColor"
              d="M28.103 10.5V3.454h.878v3.423h.079l3.085-3.423h1.104l-2.817 3.042 3.076 4.004H32.37l-2.544-3.394-.845.933V10.5z"
            ></path>
          </svg>
        </div>

        <el-input
          v-model="filterText"
          class="filter-input"
          placeholder="Filter keyword"
        />
      </div>

      <el-tree
        ref="treeRef"
        :data="data"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
      />
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
</style>
