import { BrandDocker } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.docker-compose-prettify.title'),
  path: '/docker-compose-prettify',
  description: translate('tools.docker-compose-prettify.description'),
  keywords: ['docker', 'compose', 'yaml', 'yml', 'prettify', 'format', 'beautify'],
  component: () => import('./docker-compose-prettify.vue'),
  icon: BrandDocker,
});
