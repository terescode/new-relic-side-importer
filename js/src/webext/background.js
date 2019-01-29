/* eslint-env webextensions */
/*
 * Copyright (C) 2017, Terescode, LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Scott DeWitt <scott@terescode.com>, 2017
 */

import browser from 'webextension-polyfill';

function getActiveTab() {
  return browser.tabs.query({active: true, currentWindow: true});
}

function handleClick() {
  return getActiveTab().then(
    tabs => {
      return browser.tabs.insertCSS(tabs[0].id, {
        file: '/css/styles.css'
      }).then(
        () => {
          return browser.tabs.executeScript(tabs[0].id, {
            file: '/dist/js/web-ext/content.js'
          });
        }
      );
    }
  ).catch(
    error => {
      // todo
      console.log(error);
    }
  );
}

function handleMessage(message) {
  return false;
}

// Main logic
browser.runtime.onMessage.addListener(handleMessage);
browser.browserAction.onClicked.addListener(handleClick);
