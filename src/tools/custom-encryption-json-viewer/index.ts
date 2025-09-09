import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.customEncryption.title'),
  path: '/custom-encryption-json-viewer',
  description: translate('tools.customEncryption.description'),
  keywords: ['cypher', 'encipher', 'text', 'AES'],
  component: () => import('./encryption.vue'),
  icon: Lock,
  redirectFrom: ['/cypher'],
});
