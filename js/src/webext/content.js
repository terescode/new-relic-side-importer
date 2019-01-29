/* eslint-env browser */

import WdPromiseEmitter from './wd-promise-emitter';
import MicroModal from 'micromodal';

(function() {

  function clickIt() {
    const selector = document.querySelector('#nr-side-selector');
    selector.click();
  }

  function copyToClipboard() {
    const script = document.querySelector('#nr-side-modal-script').value;
    navigator.clipboard.writeText(script);
    alert('Code copied!');
  }

  function onChange() {
    const fileList = this.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    const reader = new FileReader();
    reader.onload = () => {
      const project = JSON.parse(reader.result);
      let commands = [],
        script = '',
        inPromise = false;

      project.tests.forEach((test) => {
        test.commands.forEach((command) => {
          let result = WdPromiseEmitter.emit(command);
          if (result !== null) {
            commands.push(result);
          }
        });
      });

      script += `const assert = require('assert'),
  BASE_URL = '${project.url}';
`;
      commands.forEach((command) => {
        if (command.promise) {
          if (!inPromise) {
            inPromise = true;
            script += command.code + '.then(function () {';
            return;
          }
          inPromise = false;
          script += `return ${command.code};})`;
          return;
        }
        script += command.code;
      });

      if (inPromise) {
        script += '})';
      }

      document.querySelector('#nr-side-modal-script').value = script;
      MicroModal.init();
      MicroModal.show('nr-side-modal');
    };
    reader.onerror = (error) => {
      alert('Reading the file failed: ' + error.getMessage());
    };
    reader.onabort = () => {
      alert('Reading the file was aborted by the user!');
    };
    reader.readAsText(file);
  }

  const editor = document.querySelector('div[code-editor]'),
    root = document.querySelector('#nr-side-root');

  if (!editor) {
    alert('This doesn\'t look like a New Relic Script Editor page!');
    return;
  }

  if (root) {
    clickIt();
    return;
  }

  const div = document.createElement("div");
  div.innerHTML = `
  <style type="text/css">
  .modal {
    display: none;
  }

  .modal.is-open {
    display: block;
  }
  </style>
  <div id="nr-side-root">
    <input type="file" id="nr-side-selector" name="nr-side-selector" style="display: none;" />
  </div>
  <div id="nr-side-modal" class="modal micromodal-slide" aria-hidden="true">
    <div tabindex="-1" class="modal__overlay" data-micromodal-close>
      <div role="dialog" class="modal__container" aria-modal="true" aria-labelledby="nr-side-modal-title" >
        <header class="modal__header">
          <h2 class="modal__title" id="nr-side-modal-title">
            Imported Code Snippet
          </h2>
          <button class="modal__close"  aria-label="Close modal" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="nr-side-modal-content">
          <textarea id="nr-side-modal-script" rows="20" cols="80"></textarea>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary">Copy to clipboard</button>
          <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
        </footer>
      </div>
    </div>
  </div>
  `;
  document.body.appendChild(div);

  document.querySelector('#nr-side-selector')
    .addEventListener('change', onChange);
  document.querySelector('#nr-side-modal button.modal__btn-primary')
    .addEventListener('click', copyToClipboard);
  clickIt();
}());
