<script setup lang="ts">
import { onMounted, watch, ref, toRaw  } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
// import ImageTool from "@editorjs/image";
import ImageTool from '@/packages/editorjs-image/src'
import Delimiter from '@editorjs/delimiter'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import CodeTool from '@editorjs/code'
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import LinkTool from '@editorjs/link'
import Warning from '@editorjs/warning'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
import { ElNotification } from 'element-plus'
import { useDailyStore, type DailyResource } from '@/stores/daily'

console.log('Editor.js 组件加载中...', ImageTool)

let editor
const dailyStore = useDailyStore()
const editorState = dailyStore.editorState
const daily = dailyStore.daily

const loadFileStatus = ref('loading')

const loadFile = async (filename) => {
  console.log('加载文件:', filename)
  loadFileStatus.value = 'loading'
  const result = await daily.load(filename)
  if (result) {
    loadFileStatus.value = 'success'
    // 如果文件存在且读取成功，加载内容到编辑器
    editor.clear()
    console.log('文件内容:', toRaw(daily.getContent()))
    editor.render(toRaw(daily.getContent()))
    console.log('文件加载成功', result.files)
  } else {
    // 如果文件不存在或读取失败，显示错误信息
    loadFileStatus.value = 'error'
  }
}

const saveFile = async () => {
  // 保存文件逻辑
  const outputData = await editor.save()
  console.log('保存的内容:', outputData)
  daily.updateContent(outputData)
  daily.save()
  ElNotification({
    title: '文件保存成功',
    message: `加密保存到 “文档/DailyGPG/${editorState.filename}” `,
    type: 'success',
    position: 'bottom-right',
  })
}

watch(
  () => editorState.filename,
  (newFilename) => {
    loadFile(newFilename)
  },
  { immediate: true },
)

onMounted(() => {
  editor = new EditorJS({
    /**
     * Enable/Disable the read only mode
     */
    readOnly: false,

    /**
     * Wrapper of Editor
     */
    holder: 'editorjs',

    /**
     * Common Inline Toolbar settings
     * - if true (or not specified), the order from 'tool' property will be used
     * - if an array of tool names, this order will be used
     */
    // inlineToolbar: ['link', 'marker', 'bold', 'italic'],
    // inlineToolbar: true,

    /**
     * Tools list
     */
    tools: {
      /**
       * Each Tool is a Plugin. Pass them via 'class' option with necessary settings {@link docs/tools.md}
       */
      header: {
        class: Header,
        inlineToolbar: ['marker', 'link'],
        config: {
          placeholder: 'Header',
        },
        shortcut: 'CMD+SHIFT+H',
      },

      /**
       * Or pass class directly without any configuration
       */
      image: {
        class: ImageTool,
        config: {
          /**
           * Custom uploader
           */
          uploader: {
            /**
             * Upload file to the server and return an uploaded image data
             * @param {File} file - file selected from the device or pasted by drag-n-drop
             * @return {Promise.<{success, file: {url}}>}
             */
            uploadByFile(file) {
              return new Promise(async (resolve, reject) => {
                const formData = new FormData()
                formData.append('file', file)
                const newResource: DailyResource = {
                  type: file.type,
                  name: file.name,
                  data: new Uint8Array(await file.arrayBuffer()),
                  url: '',
                }
                console.log("上传文件:", `anjinote://${newResource.name}`, newResource)
                daily.addResource(newResource)
                resolve({
                  success: 1,
                  file: {
                    url: `anjinote://${newResource.name}`, // Randomly select a URL from the array
                  },
                })
              })
            },

            /**
             * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
             * @param {string} url - pasted image URL
             * @return {Promise.<{success, file: {url}}>}
             */
            uploadByUrl(url) {
              // your ajax request for uploading
              console.log(url)
            },
          },
        },
      },

      list: {
        class: List,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+L',
      },

      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },

      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: "Quote's author",
        },
        shortcut: 'CMD+SHIFT+O',
      },

      warning: Warning,

      marker: {
        class: Marker,
        shortcut: 'CMD+SHIFT+M',
      },

      code: {
        class: CodeTool,
        shortcut: 'CMD+SHIFT+C',
      },

      delimiter: Delimiter,

      inlineCode: {
        class: InlineCode,
        shortcut: 'CMD+SHIFT+C',
      },

      linkTool: LinkTool,

      embed: Embed,

      table: {
        class: Table,
        inlineToolbar: true,
        shortcut: 'CMD+ALT+T',
      },
    },
    onReady: function () {
      //   saveButton.click();
    },
    onChange: function (api, event) {
      console.log('something changed', event)
    },
  })

  const block = [
    {
      id: '5tSIo0TRuG',
      type: 'header',
      data: {
        text: 'Editor.js',
        level: 2,
      },
    },
    {
      id: '3HVQPk3Nju',
      type: 'paragraph',
      data: {
        text: 'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration.',
      },
    },
    {
      id: 'bdoJLRNDDT',
      type: 'header',
      data: {
        text: 'Key features',
        level: 3,
      },
    },
    {
      id: 'aXoBVRH1XQ',
      type: 'list',
      data: {
        style: 'unordered',
        meta: {},
        items: [
          {
            content: 'It is a block-styled editor',
            meta: {},
            items: [],
          },
          {
            content: 'It returns clean data output in JSON',
            meta: {},
            items: [],
          },
          {
            content: 'Designed to be extendable and pluggable with a simple API',
            meta: {},
            items: [],
          },
        ],
      },
    },
    {
      id: 'esf9kh0yZx',
      type: 'header',
      data: {
        text: 'What does it mean «block-styled editor»',
        level: 3,
      },
    },
    {
      id: 'tI4oymnsLS',
      type: 'paragraph',
      data: {
        text: 'Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class="cdx-marker">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor\'s Core.',
      },
    },
    {
      id: 'PpEkR1wIAp',
      type: 'paragraph',
      data: {
        text: 'There are dozens of <a href="https://github.com/editor-js">ready-to-use Blocks</a> and the <a href="https://editorjs.io/creating-a-block-tool">simple API</a> for creation any Block you need. For example, you can implement Blocks for Tweets, Instagram posts, surveys and polls, CTA-buttons and even games.',
      },
    },
    {
      id: 'TvzECN9ssY',
      type: 'header',
      data: {
        text: 'What does it mean clean data output',
        level: 3,
      },
    },
    {
      id: 'nXWUqskMGO',
      type: 'paragraph',
      data: {
        text: 'Classic WYSIWYG-editors produce raw HTML-markup with both content data and content appearance. On the contrary, Editor.js outputs JSON object with data of each Block. You can see an example below',
      },
    },
    {
      id: 'GyNUcH0hWI',
      type: 'paragraph',
      data: {
        text: 'Given data can be used as you want: render with HTML for <code class="inline-code">Web clients</code>, render natively for <code class="inline-code">mobile apps</code>, create markup for <code class="inline-code">Facebook Instant Articles</code> or <code class="inline-code">Google AMP</code>, generate an <code class="inline-code">audio version</code> and so on.',
      },
    },
    {
      id: 'qPTrujNBEB',
      type: 'paragraph',
      data: {
        text: 'Clean data is useful to sanitize, validate and process on the backend.',
      },
    },
    {
      id: 'sT6ESkXE9v',
      type: 'delimiter',
      data: {},
    },
    {
      id: 'j6SdttMdHp',
      type: 'paragraph',
      data: {
        text: 'We have been working on this project more than three years. Several large media projects help us to test and debug the Editor, to make its core more stable. At the same time we significantly improved the API. Now, it can be used to create any plugin for any task. Hope you enjoy. 😏',
      },
    },
  ]

  editor.isReady.then(() => {
    editorState.editorIsReady = true
    editorState.saveFile = saveFile
  })
})
</script>

<template>
  <div class="editor-container">
    <div id="editorjs" v-show="loadFileStatus == 'success'"></div>
    <div class="loading-skeleton" v-show="loadFileStatus == 'loading'">
      <el-skeleton :rows="5" animated />
      <div class="tip">加载文档需要密钥，请按照弹窗进行操作</div>
    </div>
    <div class="load-error" v-show="loadFileStatus == 'error'">
      <svg
        t="1753175586986"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="6489"
        width="10em"
        height="10em"
      >
        <path
          d="M123.822301 499.761566h779.122939V1024H123.822301z"
          fill="#0093DD"
          p-id="6490"
        ></path>
        <path
          d="M176.580055 283.488168h167.055088v216.874435H176.580055zM681.652065 286.003622h169.014026v214.147505H681.652065z"
          fill="#0093DD"
          p-id="6491"
        ></path>
        <path
          d="M520.340225 0.009852C270.252892 1.812965 176.691358 233.724473 176.691358 284.534419c68.418124 0 142.601758 3.817702 158.262129 3.817703h7.991576c18.68782-76.465351 87.551158-133.207762 169.737497-133.207762 81.8413 0 150.348466 56.208155 169.403587 132.161511h10.774158c140.687342 0 157.215879 1.046251 157.215878 1.046251S793.879159-1.949085 520.340225 0.009852z"
          fill="#0093DD"
          p-id="6492"
        ></path>
        <path
          d="M238.130767 280.560892C365.239109 21.346691 543.435655 57.408952 646.469099 73.380972c0 0-135.489479-64.88981-265.725444-0.912686-127.72051 62.741657-142.635149 208.092607-142.635149 208.092606zM121.039719 759.654717s86.694122-96.844981 156.525799-122.433604c91.123993-33.390983 202.42727-22.961866 386.778887-59.825512 65.245981-13.055874 85.558829-29.21711 185.030568-80.694875 8.403397-4.340828 59.836642-3.483793 59.836641-3.483793l-4.185003 69.564548C791.641963 681.742423 532.861844 748.19048 511.302399 747.144229c218.900155 29.361804 335.746335-84.111886 383.295095-91.135123C783.984297 891.148409 391.640246 879.30574 391.640246 879.30574c227.481637 61.918013 412.523335-30.608401 412.523335-30.608401-103.656742 171.473828-486.261756 148.178053-486.261756 148.178052-39.991267 3.472662-72.34713 29.20598-72.34713 29.20598L122.442141 1029.565164 121.039719 759.654717z"
          fill="#FFFFFF"
          p-id="6493"
        ></path>
      </svg>
      <p class="tip">加载文件失败，请检查密钥是否正确。</p>
      <el-button type="primary" @click="loadFile(editorState.filename)">重新加载</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: auto;

  #editorjs {
    width: 100%;
    height: 100%;
  }

  .loading-skeleton,
  .load-error {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 800px;
    margin: 0 auto;

    .tip {
      margin-top: 20px;
      color: #999;
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
}
</style>
