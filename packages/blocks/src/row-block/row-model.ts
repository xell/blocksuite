import { BaseBlockModel } from '@blocksuite/store';
import { literal } from 'lit/static-html.js';

export class RowBlockModel extends BaseBlockModel {
  flavour = 'affine:row' as const;
  tag = literal`affine-row`;
}
