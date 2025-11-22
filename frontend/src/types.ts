import type { EquipmentItem, ItemStatus } from './shared-types';

export type BoardItem = EquipmentItem & {
  dndId: string;
  viewOwner: 'jonne' | 'frank' | 'shared';
  currentStatus: ItemStatus;
};
