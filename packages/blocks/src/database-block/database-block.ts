import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DatabaseBlockModel } from './database-model.js';
import {
  BLOCK_ID_ATTR,
  BlockElementWithService,
  BlockHost,
  NonShadowLitElement,
} from '../__internal__/index.js';
import { repeat } from 'lit/directives/repeat.js';
import TagTypes = BlockSuiteInternal.ColumnTypes;
import { assertEqual } from '@blocksuite/global/utils';
import { DatabaseBlockDisplayMode } from './database-model.js';
import { styleMap } from 'lit/directives/style-map.js';

const MODEL_CELL_WIDTH = 200; // px

// @ts-expect-error
function TagCircle(tag: TagTypes) {
  return html`
    <div
      class="affine-database-block-tag-circle"
      style="background-color: ${tag.metadata.color}"
    ></div>
  `;
}

function DatabaseHeader(block: DatabaseBlock) {
  return html`
    <div class="affine-database-block-header">
      ${repeat(
        block.columns,
        column => column.id,
        column => {
          return html`
            <div
              class="affine-database-block-column"
              data-column-id="${column.id}"
              style=${styleMap({
                width: `${column.metadata.width}px`,
              })}
            >
              ${column.name}
            </div>
          `;
        }
      )}
    </div>
  `;
}

function DataBaseRowContainer(block: DatabaseBlock) {
  const model = block.model;
  const host = block.host;
  assertEqual(model.mode, DatabaseBlockDisplayMode.Database);
  assertEqual(
    model.children.every(child => child.flavour === 'affine:row'),
    true
  );

  return html`
    <style>
      .affine-database-block-header {
        display: flex;
        flex-direction: row;
        border-top: 1px black solid;
      }
      .affine-database-block-column {
      }

      .affine-database-block-rows {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
      }

      .affine-database-block-row {
        width: 100%;
        border-top: 1px black solid;
      }
    </style>
    <div class="affine-database-block-rows">
      ${repeat(
        model.children,
        child => child.id,
        (child, idx) => {
          assertEqual(child.flavour, 'affine:row');
          return html`
            <div class="affine-database-block-row" data-row-id="${idx}">
              ${BlockElementWithService(child, host, () => {
                block.requestUpdate();
              })}
            </div>
          `;
        }
      )}
    </div>
  `;
}

@customElement('affine-database')
// cannot find children in shadow dom
export class DatabaseBlock extends NonShadowLitElement {
  static styles = css`
    .affine-database-block-tag-circle {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .affine-database-block-tag {
      display: inline-flex;
      border-radius: 11px;
      align-items: center;
      padding: 0 8px;
      cursor: pointer;
    }

    .affine-database-block-title {
      width: 100%;
      font-size: 32px;
      line-height: 50px;
      font-weight: 500;
      border: 0;
      font-family: inherit;
      color: inherit;
    }
  `;
  @property({
    hasChanged() {
      return true;
    },
  })
  model!: DatabaseBlockModel;
  @property()
  host!: BlockHost;

  get columns() {
    return this.model.columns;
  }

  get rows() {
    return this.model.children.map(block => {
      return this.model.columns.map(type => {
        return this.host.page.getBlockTagByType(block, type);
      });
    });
  }

  firstUpdated() {
    this.model.propsUpdated.on(() => this.requestUpdate());
    this.model.childrenUpdated.on(() => this.requestUpdate());
  }

  protected render() {
    this.setAttribute(BLOCK_ID_ATTR, this.model.id);

    return html`
      <div style="border: 1px solid;">
        <div class="affine-database-block-title">database header</div>
        ${DatabaseHeader(this)} ${DataBaseRowContainer(this)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-database': DatabaseBlock;
  }
}
