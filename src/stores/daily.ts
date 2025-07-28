import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

import mime from 'mime/lite'

import { exists, BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'
import { LazyStore } from '@tauri-apps/plugin-store'
import JSZip from 'jszip'

export interface DailyResource {
  type: string // 资源的 MIME 类型
  name: string // 资源文件名称
  data: Uint8Array // 资源内容（二进制数据）
  url: string // 资源的 blob 链接
}

export interface DailyContent {
  blocks: Array<{
    type: string // 块类型，如 'image', 'text' 等
    data: {
      url: string // 资源链接
      [key: string]: unknown // 其他可能的属性
    }
  }>
  [key: string]: unknown // 其他可能的属性
}

// 编辑器状态类型
export interface EditorState {
  filename: string
  editorIsReady: boolean
  saveFile: () => void
}

class Daily {
  private dailyDir: string = './DailyGPG/' // 日记文件夹路径
  private dailyBaseDir: BaseDirectory = BaseDirectory.Document // 基础目录
  private recipient: string = '' // GPG 加密密钥指纹

  private data: Array<DailyResource> = [] // 数据
  public name: string = '' // 日记名称
  private content: DailyContent | Object = {} // 日记内容

  constructor() {
    const store = new LazyStore('.store/settings.json')
    store
      .get('recipient')
      .then((value) => {
        if (value) {
          this.recipient = value as string
        } else {
          this.recipient = ''
          console.warn('未设置 GPG 收件人')
        }
      })
      .catch((error) => {
        this.recipient = ''
        console.error('获取 GPG 收件人失败:', error)
      })
  }

  private clear() {
    this.data = []
    this.name = ''
    this.content = {}
  }

  private checkLoaded(): void {
    if (this.data.length === 0) {
      throw new Error('日记未加载或已清空')
    }
  }

  // 加载日记资源
  async load(name: string): Promise<boolean> {
    this.clear() // 清空之前内容

    const filename = `./DailyGPG/${name}`

    const isExists = await exists(filename, {
      baseDir: this.dailyBaseDir,
    })

    let files

    if (isExists) {
      try {
        files = await this.read(filename)
      } catch (error) {
        console.error(`加载日记文件 ${name} 失败:`, error)
        return false
      }
    } else {
      console.warn(`日记文件 ${name} 不存在，创建一个新的空日记`)
      files = {
        'main.json': new TextEncoder().encode('{blocks:[]}'), // 添加一个空的 main.json
      }
    }

    // 检查是否包含 main.json
    if (!files['main.json']) {
      console.error('【不规范的Daily数据文件】日记文件中缺少 main.json')
      return false
    }

    console.log(files)

    // 依次添加资源
    for (const [fileName, content] of Object.entries(files)) {
      const resource: DailyResource = {
        type: 'application/octet-stream', // 默认类型
        name: fileName,
        data: content,
        url: '', // 资源blob url稍后生成 URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }))
      }

      // 尝试获取 MIME 类型
      const mimeType = mime.getType(fileName) || 'application/octet-stream'
      if (mimeType) {
        resource.type = mimeType
      }

      this.data.push(resource)
    }

    this.name = name

    console.log(`日记 ${name} 加载成功，包含 ${this.data.length} 个资源`, this.data)
    return true
  }

  // 获取保存日记
  async save() {
    const files: Record<string, Uint8Array> = {}
    for (const resource of this.data) {
      files[resource.name] = resource.data
    }

    // Todo: 根据content的内容筛选资源
    /**
     * content中图片表示形式
     * {
     *  "blocks": [
     *   {
     *    "type": "image",
     *    "data": {
     *      "url": "anjinote://fileName"
     *    }
     *   }
     * ]
     * }
     */

    // 提取 content 中用到的图片资源
    const images: Array<string> = []
    if (this.content && (this.content as DailyContent).blocks) {
      for (const block of (this.content as DailyContent).blocks) {
        if (block.type === 'image') {
          if (block.data.url && block.data.url.startsWith('anjinote://')) {
            images.push(block.data.url.replace('anjinote://', ''))
          }
        }
      }
    }
    // 只保留 content 中用到的图片资源
    // for (const resource of this.data) {
    //   if (resource.type.startsWith('image/') && !images.includes(resource.name)) {
    //     // 如果资源是图片且不在 content 中使用，则删除
    //     delete files[resource.name]
    //   }
    // }

    const filePath = `${this.dailyDir}${this.name}`

    console.log(`会保存日记到 ${filePath}`, files)
    await this.write(filePath, files)
  }

  // 向日记添加资源
  async addResource(resource: DailyResource) {
    this.checkLoaded()

    // 检查资源是否已存在
    const existingResource = this.getResource(resource.name)
    if (existingResource) {
      console.warn(`资源 ${resource.name} 已存在，无法重复添加`)
      return
    }

    // 添加新资源
    this.data.push(resource)

    // 如果是 main.json，则更新内容
    if (resource.name === 'main.json') {
      this.content = JSON.parse(new TextDecoder().decode(resource.data))
    }
  }

  // 获取日记主要内容
  getContent(): Object {
    this.checkLoaded()

    if (
      !this.content ||
      (typeof this.content === 'object' && Object.keys(this.content).length === 0)
    ) {
      // 查找并解析 main.json
      for (const resource of this.data) {
        if (resource.name === 'main.json') {
          this.content = JSON.parse(new TextDecoder().decode(resource.data))
          break
        }
      }
    }

    return this.content
  }

  // 更新日记内容
  updateContent(newContent: Object) {
    this.checkLoaded()

    // 更新内容
    this.content = newContent

    // 更新 main.json 资源
    for (const resource of this.data) {
      if (resource.name === 'main.json') {
        resource.data = new TextEncoder().encode(JSON.stringify(newContent))
        resource.url = '' // 清除旧的 URL，重新生成
        return
      }
    }
  }

  // 获取资源链接
  getUrl(name: string): string {
    this.checkLoaded()
    const resource = this.getResource(name)
    if (resource) {
      if (!resource.url) {
        resource.url = URL.createObjectURL(new Blob([resource.data], { type: resource.type }))
      }
      return resource.url
    }
    throw new Error(`资源 ${name} 不存在`)
  }

  getResource(name: string): DailyResource | undefined {
    this.checkLoaded()
    return this.data.find((resource) => resource.name === name)
  }

  /**
   * 读取日记文件，得到文件对象（原始为加密的压缩文件，经过解密、解压，返回解压后的文件对象）
   * @param {string} filePath - 加密文件路径（相对 Document 目录）
   * @returns {Promise<Object>} - 解压后的文件对象（key 为文件名，value 为 Uint8Array）
   */
  private async read(filePath: string): Promise<Record<string, Uint8Array>> {
    // 1. 读取加密文件为 Uint8Array
    const encryptedData = await readFile(filePath, {
      baseDir: BaseDirectory.Document,
    })

    // 2. 解密
    const decryptedData = await invoke('gpg_decrypt_buffer', {
      data: encryptedData,
    })

    // 3. 解压
    const zip = await JSZip.loadAsync(decryptedData as Uint8Array)
    const files: Record<string, Uint8Array> = {}
    const entries = Object.keys(zip.files)
    for (const name of entries) {
      const file = zip.files[name]
      if (!file.dir) {
        files[name] = await file.async('uint8array')
      }
    }

    return files // { 文件名: Uint8Array, ... }
  }

  private async write(filePath: string, files: Record<string, Uint8Array>): Promise<void> {
    // 1. 压缩文件
    const zip = new JSZip()
    for (const [name, content] of Object.entries(files)) {
      zip.file(name, content)
    }
    // 生成 zip 的 Uint8Array
    const zippedData = await zip.generateAsync({ type: 'uint8array' })

    // 2. 加密
    const encryptedData = await invoke('gpg_encrypt_buffer', {
      data: zippedData,
      recipient: this.recipient,
    })

    // 3. 写入文件
    await writeFile(filePath, new Uint8Array(encryptedData as ArrayBuffer), {
      baseDir: BaseDirectory.Document,
    })
  }
}

// 声明 window.daily
declare global {
  interface Window {
    daily: Daily
  }
}

export const useDailyStore = defineStore('daily', () => {
  const daily = new Daily()

  window.daily = daily // 暴露给全局对象

  const editorState = reactive<EditorState>({
    filename: `${new Date().toISOString().slice(0, 10)}.daily`,
    editorIsReady: false,
    saveFile: () => {},
  })

  return {
    daily,
    editorState,
  }
})
