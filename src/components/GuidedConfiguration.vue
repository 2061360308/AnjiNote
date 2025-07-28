<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { LazyStore } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

const emit = defineEmits<{
  (e: "close-guided-configuration"): void;
}>();

const store = new LazyStore(".store/settings.json");

// 步骤：0=检查依赖，1=选择目录，2=完成
const currentStep = ref(0);

// 依赖检查相关
const gpgStatus = ref<"checking" | "installed" | "not_installed">("checking");
const gpgDesc = ref("正在检测 GnuPG 是否已安装...");

// 选择目录相关
const recipient = ref("");
const recipientStatus = ref<"valid" | "invalid" | "none">("none");

// 模拟API请求，实际应替换为真实API
async function checkGpg() {
  gpgStatus.value = "checking";
  gpgDesc.value = "正在检测 GnuPG 是否已安装...";
  try {
    const res = await invoke("gpg_check_installed");
    console.log("GPG 检测结果：", res);
    // 等一段最短的时间，防止快速闪动
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (res) {
      gpgStatus.value = "installed";
      gpgDesc.value = "GnuPG 已安装，可以继续下一步。";
    } else {
      gpgStatus.value = "not_installed";
      console.error("未检测到 GnuPG，请先下载安装。");
    }
  } catch (error) {
    gpgStatus.value = "not_installed";
    console.error("检测 GnuPG 失败，", error);
  }
}

const selectRecipient = async () => {
  console.log("选择 GPG 密钥指纹：", recipient.value);
  if (!recipient.value) {
    recipientStatus.value = "none";
    return;
  }

  const result = await invoke("gpg_check_key_can_encrypt", {
    recipient: recipient.value,
  });
  console.log("检查密钥是否可用：", result);
  if (result) {
    await store.set("recipient", recipient.value);
    recipientStatus.value = "valid";
  } else {
    recipientStatus.value = "invalid";
  }
};

// 步骤切换
function nextStep() {
  if (currentStep.value === 0 && gpgStatus.value === "installed") {
    currentStep.value = 1;
  } else if (currentStep.value === 1 && recipientStatus.value === "valid") {
    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    // 完成配置，关闭引导
    emit("close-guided-configuration");
  }
}

onMounted(async () => {
  checkGpg();
  recipient.value = (await store.get("recipient")) ?? "";
});
</script>

<template>
  <el-main>
    <div class="main-grid">
      <div class="title">GPGDaily 启动前需要简单配置</div>
      <div class="main-content-area">
        <div class="left-panel">
          <div class="steps-indicator">
            <div
              v-for="(step, idx) in [
                '检查 GnuPG 安装',
                '选择加密密钥',
                '配置完成',
              ]"
              :key="idx"
              class="step-item"
            >
              <span
                class="step-circle"
                :class="{ active: currentStep === idx }"
                >{{ idx + 1 }}</span
              >
              <span
                class="step-label"
                :class="{ active: currentStep === idx }"
                >{{ step }}</span
              >
              <div v-if="idx < 2" class="step-line"></div>
            </div>
          </div>

          <div class="steps-operations">
            <div v-if="currentStep === 0">
              <el-button @click="checkGpg">重新检测</el-button>
              <el-alert
                v-if="gpgStatus === 'checking'"
                title="正在检测 GnuPG..."
                type="info"
                show-icon
                style="margin-top: 20px"
                :closable="false"
              />
              <el-alert
                v-else-if="gpgStatus === 'installed'"
                title="GnuPG 已安装"
                type="success"
                show-icon
                :description="gpgDesc"
                style="margin-top: 20px"
                :closable="false"
              />
              <el-alert
                v-else
                title="未检测到 GnuPG"
                type="error"
                show-icon
                style="margin-top: 20px"
                :closable="false"
              >
                <template #default>
                  <span>未检测到 GnuPG，请先下载安装。</span>
                  <a href="https://www.gnupg.org/download/" target="_blank"
                    >GnuPG 官网下载</a
                  >
                </template>
              </el-alert>
            </div>
            <div v-else-if="currentStep === 1">
              <el-alert
                v-if="recipientStatus === 'none'"
                title="请选择要使用GPG密钥"
                type="info"
                :closable="false"
                show-icon
                description="填入密钥对应唯一指纹。"
                style="margin-top: 20px"
              />
              <el-alert
                v-else-if="recipientStatus === 'valid'"
                title="验证通过，密钥指纹有效"
                type="success"
                :closable="false"
                description="请继续下一步配置。"
                show-icon
                style="margin-top: 20px"
              />
              <el-alert
                v-else
                title="密钥指纹无效"
                type="error"
                :closable="false"
                description="请检查指纹是否正确，或生成新的密钥。"
                show-icon
                style="margin-top: 20px"
              />
              <div>
                <el-input
                  v-model="recipient"
                  placeholder="填入密钥对应唯一指纹。"
                  style="max-width: 600px"
                  class="input-with-select"
                >
                  <template #append>
                    <el-button type="primary" plain @click="selectRecipient"
                      >选择</el-button
                    >
                  </template>
                </el-input>
              </div>
            </div>
            <div v-else-if="currentStep === 2">
              <el-result
                icon="success"
                title="配置完成"
                sub-title="您已完成所有配置，可以开始使用应用。"
                style="padding: 0"
              />
            </div>
            <el-button
              style="margin-top: 24px"
              type="primary"
              :disabled="gpgStatus !== 'installed'"
              @click="nextStep"
              >下一步</el-button
            >
          </div>
        </div>
        <div class="right-panel">
          <div class="steps-info">
            <div v-if="currentStep === 0">
              <div>
                <h4>什么是 GnuPG？</h4>
                <p>
                  <b>GnuPG</b>（GNU Privacy
                  Guard）是一款开源的加密工具，广泛用于数据加密和数字签名，保护您的隐私和数据安全。<br />
                  本应用依赖 GnuPG 进行密钥管理和加密操作。
                </p>
                <p>
                  <b>下载与安装：</b><br />
                  您可以从
                  <a href="https://www.gnupg.org/download/" target="_blank"
                    >GnuPG 官网</a
                  >
                  下载适用于 Windows、macOS 或 Linux 的安装包。<br />
                  Windows 用户建议下载
                  <a
                    href="https://www.gpg4win.org/download.html"
                    target="_blank"
                    >Gpg4win</a
                  >
                  套件，包含图形界面和命令行工具。
                </p>
                <p>
                  <b>常见用途：</b><br />
                  • 生成和管理加密密钥<br />
                  • 对文件和邮件进行加密/解密<br />
                  • 验证文件和消息的数字签名
                </p>
                <p style="color: #888; font-size: 13px">
                  如遇安装或检测问题，请参考
                  <a href="https://www.gnupg.org/documentation/" target="_blank"
                    >官方文档</a
                  >
                  或联系技术支持。
                </p>
              </div>
            </div>
            <div v-else-if="currentStep === 1">
              <div>
                <h4>工作目录说明</h4>
                <p>
                  工作目录是本应用用于存储您的文件和配置的地方。请确保选择一个易于访问且有足够空间的目录。
                </p>
                <p>
                  您可以在任何时候通过设置菜单更改工作目录，但建议在开始使用前先设置好。
                </p>
              </div>
            </div>
            <div v-else-if="currentStep === 2">
              <div>
                <h4>配置完成</h4>
                <p>
                  您已成功完成 GPGDaily
                  的初始配置。现在可以开始使用应用进行文件加密和管理了。
                </p>
                <p>如果需要更改设置，可以在应用菜单中找到相关选项。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-main>
</template>

<style lang="scss" scoped>
.el-main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  background: #f7f8fa;
}

.main-grid {
  display: grid;
  grid-template-rows: 56px 1fr;
  height: 100%;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  padding: 20px 32px;
  max-width: 800px;

  .title {
    font-size: 24px;
    font-weight: bold;
    color: #222;
    display: flex;
    align-items: center;
    margin: 0 auto;
    margin-bottom: 12px;
  }
}

.main-content-area {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 32px;
  height: 100%;
}

.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  .steps-indicator {
    // background: #f5f7fa;
    border-radius: 8px;
    padding: 18px 16px;
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .step-item {
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
      .step-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #e0e7ef;
        color: #888;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 15px;
        margin-right: 10px;
        transition: all 0.2s;
        &.active {
          background: #409eff;
          color: #fff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
        }
      }
      .step-label {
        font-size: 15px;
        color: #666;
        transition: color 0.2s;
        &.active {
          color: #409eff;
          font-weight: bold;
        }
      }
      .step-line {
        position: absolute;
        left: 13px;
        top: 28px;
        width: 2px;
        height: 18px;
        background: #e0e7ef;
        z-index: 0;
      }
    }
  }
  .steps-operations {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    .el-alert {
      margin-bottom: 16px;
    }
    margin-bottom: 20px;
  }
}

.right-panel {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  .el-alert,
  .el-result {
    margin-bottom: 16px;
  }

  .steps-info {
    flex: 1;
    background: #f5f7fa;
    border-radius: 6px;
    padding: 16px 20px;
    font-size: 15px;
    color: #444;
    h4 {
      margin: 0 0 8px 0;
      font-size: 17px;
      color: #222;
      font-weight: bold;
    }
    a {
      color: #409eff;
      text-decoration: underline;
      &:hover {
        color: #66b1ff;
      }
    }
  }
}
</style>
