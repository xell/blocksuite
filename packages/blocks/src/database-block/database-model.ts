import { BaseBlockModel, Page } from '@blocksuite/store';
import { literal } from 'lit/static-html.js';
import ColumnTypes = BlockSuiteInternal.ColumnTypes;

export enum DatabaseBlockDisplayMode {
  Text,
  Grid,
  Database,
}

export class DatabaseBlockModel extends BaseBlockModel {
  flavour = 'affine:database' as const;
  tag = literal`affine-database`;
  /**
   * Tip: this is a yArray proxy from upstream
   */
  columns: ColumnTypes[];
  mode: DatabaseBlockDisplayMode;

  constructor(
    page: Page,
    props: PropsWithId<Partial<BlockSuiteModelProps.DatabaseBlockModel>>
  ) {
    super(page, props);
    this.columns = props.columns ?? [];
    this.mode = DatabaseBlockDisplayMode.Database;
  }
}
