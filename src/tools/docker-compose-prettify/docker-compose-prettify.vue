<script setup lang="ts">
import yaml from 'yaml';
import { useStorage } from '@vueuse/core';
import { formatYaml, normalizeYamlIndentation } from './yaml-models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const inputElement = ref<HTMLElement>();

const defaultCompose = `version: "3.8"
services:
  web:
    image: nginx:latest
    ports: ["80:80"]
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
    restart: always
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: example
    ports:
      - "5432:5432"`;

const rawYaml = useStorage('docker-compose-prettify:raw-yaml', defaultCompose);
const indentSize = useStorage('docker-compose-prettify:indent-size', 2);
const sortKeys = useStorage('docker-compose-prettify:sort-keys', false);

// Normalize indentation so pasted compose files (tabs, non-breaking / full-width spaces…)
// parse and beautify. Tabs are expanded to the width that yields valid YAML; Unicode
// whitespace collapses to a single space. See yaml-models.ts for details.
const normalizedYaml = computed(() => normalizeYamlIndentation(rawYaml.value));

const cleanYaml = computed(() =>
  withDefaultOnError(() => formatYaml({ rawYaml: normalizedYaml, indentSize, sortKeys }), ''),
);

const rawYamlValidation = useValidation({
  source: normalizedYaml,
  rules: [
    {
      validator: v => v === '' || yaml.parse(v),
      message: 'Provided docker-compose YAML is not valid.',
    },
  ],
});

const cleanYamlBase64 = computed(() => `data:application/yaml;base64,${textToBase64(cleanYaml.value)}`);
const { download } = useDownloadFileFromBase64({ source: cleanYamlBase64, filename: 'docker-compose.yml' });
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 600px" flex justify-center gap-3>
      <n-form-item label="Sort keys :" label-placement="left" label-width="100">
        <n-switch v-model:value="sortKeys" />
      </n-form-item>
      <n-form-item label="Indent size :" label-placement="left" label-width="100" :show-feedback="false">
        <n-input-number v-model:value="indentSize" min="1" max="10" style="width: 100px" />
      </n-form-item>
    </div>

    <n-form-item
      label="Your raw docker-compose"
      :feedback="rawYamlValidation.message"
      :validation-status="rawYamlValidation.status"
    >
      <c-input-text
        ref="inputElement"
        v-model:value="rawYaml"
        placeholder="Paste your raw docker-compose YAML here..."
        rows="20"
        multiline
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        monospace
      />
    </n-form-item>

    <n-form-item label="Beautified and formatted docker-compose">
      <TextareaCopyable :value="cleanYaml" language="yaml" :follow-height-of="inputElement" />
    </n-form-item>

    <div mt-5 flex justify-center>
      <c-button :disabled="cleanYaml === ''" secondary @click="download">
        Download docker-compose.yml
      </c-button>
    </div>
  </div>
</template>
