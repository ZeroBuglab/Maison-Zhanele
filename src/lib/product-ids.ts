import { randomUUID } from 'node:crypto';

export function createInternalSku(prefix = 'MZ') {
  return `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}
