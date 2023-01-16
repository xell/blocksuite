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
import { assertEquals } from '@blocksuite/global/utils';
import { DatabaseBlockDisplayMode } from './database-model.js';
import { styleMap } from 'lit/directives/style-map.js';

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
      <div class="affine-database-block-add-column">+</div>
    </div>
  `;
}

function DataBaseRowContainer(block: DatabaseBlock) {
  const model = block.model;
  const host = block.host;
  assertEquals(model.mode, DatabaseBlockDisplayMode.Database);
  assertEquals(
    model.children.every(child => child.flavour === 'affine:row'),
    true
  );

  return html`
    <style>
      .affine-database-block-header {
        display: flex;
        flex-direction: row;
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
        border-top: 1px solid rgb(238, 238, 237);
      }
    </style>
    <div class="affine-database-block-rows">
      ${repeat(
        model.children,
        child => child.id,
        (child, idx) => {
          assertEquals(child.flavour, 'affine:row');
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
    .affine-database-block {
      border-top: 1px solid rgb(238, 238, 237);
      border-bottom: 1px solid rgb(238, 238, 237);
    }

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
      min-height: 1em;
      height: 40px;
      font-size: 22px;
      font-weight: 700;
      border: 0;
      font-family: inherit;
      color: inherit;
    }

    .affine-database-block-title::placeholder {
      color: var(--affine-placeholder-color);
    }

    .affine-database-block-title:disabled {
      background-color: transparent;
    }

    .affine-database-block-footer {
      border-top: 1px solid rgb(238, 238, 237);
    }

    .affine-database-block-add-row {
      user-select: none;
      transition: background 20ms ease-in 0s;
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 32px;
      width: 100%;
      padding-left: 8px;
      font-size: 14px;
      line-height: 20px;
      border-top: 1px solid rgb(233, 233, 231);
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

  public _addRow() {
    this.model.page.addBlockByFlavour('affine:row', {}, this.model.id);
  }

  protected render() {
    this.setAttribute(BLOCK_ID_ATTR, this.model.id);

    return html`
      <div class="affine-database-block">
        <div>
          <input
            class="affine-database-block-title"
            .value=${this.model.title}
            placeholder="Database"
          ></input>
        </div>
        ${DatabaseHeader(this)} ${DataBaseRowContainer(this)}
        <div class="affine-database-block-footer">
          <div class="affine-database-block-add-row"
               @click=${this._addRow}
          >
            + New
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-database': DatabaseBlock;
  }
}
