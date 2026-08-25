<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Fuse from 'fuse.js';
import { categoryTranslations, codeTranslations, codesByCategories } from './http-status-codes.constants';

const { locale } = useI18n();
const search = ref('');

// Localized label for the synthetic "search results" group header.
const searchResultLabels: Record<string, string> = {
  zh: '搜索结果',
};

function localizeCategory(category: string): string {
  return categoryTranslations[locale.value]?.[category] ?? category;
}

function localizeCode(code: number, fallbackName: string, fallbackDescription: string) {
  const translation = codeTranslations[locale.value]?.[code];
  return {
    name: translation?.name ?? fallbackName,
    description: translation?.description ?? fallbackDescription,
  };
}

function typeSuffix(type: string): string {
  if (type === 'HTTP') {
    return '';
  }
  return locale.value === 'zh' ? ` 适用于 ${type}。` : ` For ${type}.`;
}

// Category groups with strings resolved to the current page language (English fallback).
const localizedGroups = computed(() =>
  codesByCategories.map(group => ({
    category: group.category,
    categoryLabel: localizeCategory(group.category),
    codes: group.codes.map((code) => {
      const { name, description } = localizeCode(code.code, code.name, code.description);
      return { ...code, name, description, suffix: typeSuffix(code.type) };
    }),
  })),
);

// Flattened entries used for the (locale-aware) fuzzy search index.
const localizedEntries = computed(() =>
  localizedGroups.value.flatMap(({ category, categoryLabel, codes }) =>
    codes.map(code => ({ ...code, category, categoryLabel, suffix: typeSuffix(code.type) })),
  ),
);

const fuse = computed(
  () =>
    new Fuse(localizedEntries.value, {
      keys: [
        { name: 'code', weight: 3 },
        { name: 'name', weight: 2 },
        'description',
        'categoryLabel',
      ],
    }),
);

const searchResult = computed(() => {
  const query = search.value.trim();

  if (!query) {
    return localizedEntries.value;
  }

  return fuse.value.search(query).map(({ item }) => item);
});

const codesByCategoryFiltered = computed(() => {
  if (!search.value.trim()) {
    return localizedGroups.value;
  }

  return [
    {
      category: 'Search results',
      categoryLabel: searchResultLabels[locale.value] ?? 'Search results',
      codes: searchResult.value,
    },
  ];
});
</script>

<template>
  <div>
    <c-input-text
      v-model:value="search"
      placeholder="Search http status..."
      autofocus raw-text mb-10
    />

    <div v-for="{ codes, category, categoryLabel } of codesByCategoryFiltered" :key="category" mb-8>
      <div mb-2 text-xl>
        {{ categoryLabel }}
      </div>

      <c-card v-for="{ code, description, name, suffix } of codes" :key="code" mb-2>
        <div text-lg font-bold>
          {{ code }} {{ name }}
        </div>
        <div op-70>
          {{ description }}{{ suffix }}
        </div>
      </c-card>
    </div>
  </div>
</template>
