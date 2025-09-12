<script setup lang="ts">
import JSON5 from 'json5';
import { AES, enc, mode, pad } from 'crypto-js';
import { useStorage } from '@vueuse/core';
import { formatJson } from '@/tools/json-viewer/json.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { computedCatch } from '@/composable/computed/catchedComputed';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const inputElement = ref<HTMLElement>();

const rawJson = useStorage('json-prettify:raw-json', '{"hello": "world", "foo": "bar"}');
const indentSize = useStorage('json-prettify:indent-size', 3);
const sortKeys = useStorage('json-prettify:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatJson({ rawJson, indentSize, sortKeys }), ''));

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: [
    {
      validator: v => v === '' || JSON5.parse(v),
      message: 'Provided JSON is not valid.',
    },
  ],
});

const customDecryptSecret = ref('isAesPsd67890987');
const customDecryptInput = ref('');
const [customDecryptOutput, customDecryptError] = computedCatch(() => {
  const keyStr = customDecryptSecret.value;
  const wordArray = enc.Hex.parse(customDecryptInput.value);
  const base64Word = enc.Base64.stringify(wordArray);
  const key = enc.Utf8.parse(keyStr);
  const iv = enc.Utf8.parse(keyStr);
  const decrypted = AES.decrypt(base64Word, key, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });
  return enc.Utf8.stringify(decrypted).toString();
}, {
  defaultValue: '',
  defaultErrorMessage: 'Unable to decrypt your text',
});

// 定义一个函数用于去除字符串中所有空格
function removeAllSpaces(e: any) {
  // console.log('🚀 ~ removeAllSpaces ~ str:', e);
  // 使用正则表达式匹配所有空白字符并替换为空
  customDecryptInput.value = e.target.value.replace(/\s+/g, '');
}

function isJsonString(str: string) {
  // 首先检查是否为字符串类型
  if (typeof str !== 'string') {
    return false;
  }

  try {
    // 尝试解析JSON字符串
    const obj = JSON.parse(str);

    // 检查解析结果是否为对象且不为null
    // 这是因为JSON.parse可以解析"123"、"true"等基础类型
    if (typeof obj === 'object' && obj !== null) {
      return true;
    }
    return false;
  }
  catch (e) {
    // 解析失败，不是有效的JSON格式
    return false;
  }
}

const customDecryptOutputStr = computed(() => {
  if (customDecryptOutput.value) {
    return isJsonString(customDecryptOutput.value) ? customDecryptOutput.value : decodeURIComponent(customDecryptOutput.value);
  }
  return '';
});

function extractRequestBodyJson(str: string) {
  // 检查输入是否为字符串
  if (typeof str !== 'string') {
    return '';
  }

  // 正则表达式匹配 "requestBodyJson=" 之后到 "&se-timestamp" 之前的内容
  const regex = /requestBodyJson=(.*?)&se-timestamp/;
  const match = str.match(regex);

  // 如果匹配成功，返回捕获到的内容；否则返回空字符串
  return match ? match[1] : '';
}

function syncJSONString() {
  rawJson.value = isJsonString(customDecryptOutputStr.value) ? customDecryptOutputStr.value : extractRequestBodyJson(customDecryptOutputStr.value);
}
</script>

<template>
  <div style="flex: 0 0 100%">
    <div flex>
      <div style="flex: 1">
        <c-input-text v-model:value="customDecryptSecret" label="Your secret key:" clearable raw-text />
        <c-input-text
          v-model:value="customDecryptInput"
          label="Your encrypted text:"
          placeholder="The string to cypher"
          rows="4"
          multiline raw-text monospace autosize mt-5
          @input="removeAllSpaces"
        />
      </div>
      <div style="flex: 1">
        <c-alert v-if="customDecryptError" type="error" mt-12 title="Error while decrypting">
          {{ customDecryptError }}
        </c-alert>
        <c-input-text
          v-else
          label="Your decrypted text:"
          :value="customDecryptOutputStr"
          placeholder="Your string hash"
          rows="3"
          multiline monospace readonly autosize mt-5
        />
      </div>
    </div>
  </div>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 600px" flex justify-center gap-3>
      <n-form-item label="Sort keys :" label-placement="left" label-width="100">
        <n-switch v-model:value="sortKeys" />
      </n-form-item>
      <n-form-item label="Indent size :" label-placement="left" label-width="100" :show-feedback="false">
        <n-input-number v-model:value="indentSize" min="0" max="10" style="width: 100px" />
      </n-form-item>
      <c-button @click="syncJSONString">
        同步JSON
      </c-button>
    </div>
  </div>

  <n-form-item
    label="Your raw JSON"
    :feedback="rawJsonValidation.message"
    :validation-status="rawJsonValidation.status"
  >
    <c-input-text
      ref="inputElement"
      v-model:value="rawJson"
      placeholder="Paste your raw JSON here..."
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item label="Prettified version of your JSON">
    <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" />
  </n-form-item>
</template>
