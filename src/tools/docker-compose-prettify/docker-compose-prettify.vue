<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { formatYaml, normalizeYamlIndentation } from './yaml-models';
import {
  type ComposeIssue,
  type ComposeValidationResult,
  validateCompose,
} from './compose-validator';
import { withDefaultOnError } from '@/utils/defaults';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import { useAppTheme } from '@/ui/theme/themes';
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

// Validate the (normalized) compose file the way `docker compose config` would —
// structural / semantic checks only. Recoverable format issues are NOT reported
// here: they are repaired by normalizeYamlIndentation + formatYaml and emitted as
// clean YAML instead. Empty input is treated as valid so the field doesn't scream
// while the user is still typing.
const composeValidation = computed<ComposeValidationResult>(() => {
  if (rawYaml.value.trim() === '') {
    return { errors: [], warnings: [], isValid: true };
  }
  return validateCompose(normalizedYaml.value);
});

const allIssues = computed<ComposeIssue[]>(() => [
  ...composeValidation.value.errors,
  ...composeValidation.value.warnings,
]);

const validationStatus = computed<'error' | 'warning' | undefined>(() => {
  if (composeValidation.value.errors.length > 0) {
    return 'error';
  }
  if (composeValidation.value.warnings.length > 0) {
    return 'warning';
  }
  return undefined;
});

// Short summary shown by the n-form-item; the full list with highlighted lines
// lives in the panel below the input.
const validationFeedback = computed(() => {
  if (validationStatus.value === undefined) {
    return '';
  }
  const issues = allIssues.value;
  if (issues.length === 0) {
    return '';
  }
  const first = issues[0].message;
  return issues.length > 1
    ? `${first}  （还有 ${issues.length - 1} 处问题，见下方明细）`
    : first;
});

function caretFor(issue: ComposeIssue): string {
  const col = issue.column ?? 1;
  return `${' '.repeat(Math.max(0, col - 1))}^`;
}

const cleanYamlBase64 = computed(() => `data:application/yaml;base64,${textToBase64(cleanYaml.value)}`);
const { download } = useDownloadFileFromBase64({ source: cleanYamlBase64, filename: 'docker-compose.yml' });

const appTheme = useAppTheme();
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
      :feedback="validationFeedback"
      :validation-status="validationStatus"
    >
      <div
        class="compose-field"
        :class="{ 'is-error': validationStatus === 'error', 'is-warning': validationStatus === 'warning' }"
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
      </div>
    </n-form-item>

    <div v-if="allIssues.length" class="compose-issues">
      <div
        v-for="(issue, i) in allIssues"
        :key="i"
        class="issue"
        :class="issue.severity === 'warning' ? 'issue--warning' : 'issue--error'"
      >
        <div class="issue__head">
          <span class="issue__loc">Line {{ issue.line }}:{{ issue.column }}</span>
          <span class="issue__msg">{{ issue.message }}</span>
        </div>
        <pre
          v-if="issue.lineText"
          class="issue__snippet"
          :class="issue.severity === 'warning' ? 'issue__snippet--warning' : 'issue__snippet--error'"
        ><span class="issue__line">{{ issue.lineText }}</span>
<span class="issue__caret">{{ caretFor(issue) }}</span></pre>
      </div>
    </div>

    <n-form-item label="Beautified and formatted docker-compose">
      <TextareaCopyable :value="cleanYaml" language="yaml" :follow-height-of="inputElement" />
    </n-form-item>

    <div mt-5 flex justify-center>
      <c-button :disabled="cleanYaml === '' || composeValidation.errors.length > 0" secondary @click="download">
        Download docker-compose.yml
      </c-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.compose-field {
  width: 100%;

  :deep(.input-wrapper) {
    transition: border-color 0.2s ease-in-out;
  }

  &.is-error :deep(.input-wrapper) {
    border-color: v-bind('appTheme.error.color');

    &:hover,
    &:focus-within {
      border-color: v-bind('appTheme.error.color');
    }
  }

  &.is-warning :deep(.input-wrapper) {
    border-color: v-bind('appTheme.warning.color');

    &:hover,
    &:focus-within {
      border-color: v-bind('appTheme.warning.color');
    }
  }
}

.compose-issues {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  max-height: 320px;
  overflow: auto;
}

.issue {
  border-radius: 4px;
  border: 1px solid transparent;
  padding: 8px 10px;

  &--error {
    border-color: v-bind('appTheme.error.color');
    background-color: v-bind('appTheme.error.color + 22');
  }

  &--warning {
    border-color: v-bind('appTheme.warning.color');
    background-color: v-bind('appTheme.warning.color + 22');
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    font-size: 13px;
    line-height: 1.4;
  }

  &__loc {
    flex: 0 0 auto;
    font-family: monospace;
    font-weight: 600;
    padding: 0 6px;
    border-radius: 3px;

    .issue--error & {
      color: v-bind('appTheme.error.color');
      background-color: v-bind('appTheme.error.color + 33');
    }

    .issue--warning & {
      color: v-bind('appTheme.warning.color');
      background-color: v-bind('appTheme.warning.color + 33');
    }
  }

  &__msg {
    flex: 1 1 auto;
    min-width: 0;

    .issue--error & {
      color: v-bind('appTheme.text.baseColor');
    }
  }

  &__snippet {
    margin: 8px 0 0;
    padding: 6px 8px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12.5px;
    line-height: 1.5;
    white-space: pre;
    overflow-x: auto;
    border: 1px solid transparent;

    .issue--error & {
      border-color: v-bind('appTheme.error.color + 55');
      background-color: v-bind('appTheme.error.color + 11');
    }

    .issue--warning & {
      border-color: v-bind('appTheme.warning.color + 55');
      background-color: v-bind('appTheme.warning.color + 11');
    }
  }

  &__line {
    display: block;
  }

  &__caret {
    display: block;
    font-weight: 700;

    .issue--error & {
      color: v-bind('appTheme.error.color');
    }

    .issue--warning & {
      color: v-bind('appTheme.warning.color');
    }
  }
}
</style>
