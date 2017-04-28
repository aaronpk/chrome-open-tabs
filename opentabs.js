/*global chrome:true */

'use strict';

// consolidate async setup
const getStorageAndWindows = (callback) =>
  chrome.storage.sync.get({ chromeOpenTabs: {} }, ({ chromeOpenTabs: config }) =>
    chrome.windows.getAll({populate: true}, (windows) =>
      callback(config, windows)
    )
  );

function storeTabCount() {
  getStorageAndWindows(function (config, windows) {
      var total = 0;
      var breakdown = {};
      var windowKey;

      for (windowKey in windows) {
        if (!windows.hasOwnProperty(windowKey)) {
          return;
        }

        breakdown[windowKey] = windows[windowKey].tabs.length;

        total += windows[windowKey].tabs.length;
      }

      var d = new Date();

      var request = new XMLHttpRequest();

      request.open('POST', config.endpoint, true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Authorization', `Bearer ${config.token}`);
      request.send(JSON.stringify({
        timestamp: d.toISOString(),
        tzoffset: (d.getTimezoneOffset()/60)*(-3600),
        num_windows: windows.length,
        num_tabs: total,
        breakdown: breakdown
      }));
    });
}

chrome.alarms.create('store-tab-count', {periodInMinutes: 5});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'store-tab-count') {
    storeTabCount();
  }
});

chrome.tabs.onCreated.addListener(storeTabCount);
chrome.tabs.onRemoved.addListener(storeTabCount);

chrome.windows.onCreated.addListener(storeTabCount);
chrome.windows.onRemoved.addListener(storeTabCount);

