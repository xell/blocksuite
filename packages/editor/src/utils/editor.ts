import {
  asyncFocusRichText,
  BlockHub,
  getAllowSelectedBlocks,
  getServiceOrRegister,
  tryUpdateFrameSize,
  uploadImageFromLocal,
} from '@blocksuite/blocks';
import { assertExists } from '@blocksuite/global/utils';
import type { Page } from '@blocksuite/store';

import type { EditorContainer } from '../components/index.js';

export const checkEditorElementActive = () =>
  document.activeElement?.closest('editor-container') != null;

export const createBlockHub: (
  editor: EditorContainer,
  page: Page
) => BlockHub = (editor: EditorContainer, page: Page) => {
  const blockHub = new BlockHub({
    mouseRoot: editor,
    enableDatabase: !!page.awarenessStore.getFlag('enable_database'),
    onDropCallback: async (e, end, point) => {
      const dataTransfer = e.dataTransfer;
      assertExists(dataTransfer);
      const data = dataTransfer.getData('affine/block-hub');
      let props = JSON.parse(data);
      if (props.flavour === 'affine:database') {
        if (!page.awarenessStore.getFlag('enable_database')) {
          console.warn('database block is not enabled');
          return;
        }
      }
      if (props.flavour === 'affine:embed' && props.type === 'image') {
        props = await uploadImageFromLocal(page);
      } else {
        props = [props];
      }

      const { model, rect } = end;
      page.captureSync();
      const distanceToTop = Math.abs(rect.top - point.y);
      const distanceToBottom = Math.abs(rect.bottom - point.y);
      const ids = page.addSiblingBlocks(
        model,
        props,
        distanceToTop < distanceToBottom ? 'before' : 'after'
      );

      if (props[0].flavour === 'affine:database') {
        const service = await getServiceOrRegister(props[0].flavour);
        service.initDatabaseBlock(page, model, ids[0]);
      }

      if (ids.length === 1) {
        asyncFocusRichText(page, ids[0]);
      }
      tryUpdateFrameSize(page, 1);
    },
  });

  if (editor.mode === 'page') {
    const defaultPageBlock = editor.querySelector('affine-default-page');
    assertExists(defaultPageBlock);
    blockHub.slots = defaultPageBlock.slots;
    blockHub.getAllowedBlocks = () =>
      getAllowSelectedBlocks(defaultPageBlock.model);
  } else {
    const edgelessPageBlock = editor.querySelector('affine-edgeless-page');
    assertExists(edgelessPageBlock);
    blockHub.getAllowedBlocks = () =>
      getAllowSelectedBlocks(edgelessPageBlock.model);
  }

  return blockHub;
};
