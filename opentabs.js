/*global chrome:true */

'use strict';

function parseURL(url) {
  var href = document.createElement('a');
  href.href = url;
  return href;
}

// consolidate async setup
const getStorageAndWindows = (callback) =>
  chrome.storage.sync.get({ token: null, endpoint: null, send_what: 'counts' }, function(config) {
    chrome.windows.getAll({populate: true}, function(windows) {
      callback(config, windows)
    });
  });

function storeTabCount() {
  getStorageAndWindows(function(config, windows) {
    if(!config.endpoint) {
      return;
    }

      var total = 0;
      var breakdown = {};
      var details = {};
      var windowKey;

      for (windowKey in windows) {
        if (!windows.hasOwnProperty(windowKey)) {
          return;
        }

        breakdown[windowKey] = windows[windowKey].tabs.length;

        if(config.send_what != 'counts') {
          details[windowKey] = [];

          for (var tabKey in windows[windowKey].tabs) {
            var tab = windows[windowKey].tabs[tabKey];
            var url = parseURL(tab.url);
            var info = {
              icon: tab.favIconUrl,
              domain: url.protocol+"//"+url.hostname
            };
            if(config.send_what == 'urls') {
              info.url = tab.url;
            }

            details[windowKey].push(info);
          }
        }

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
        breakdown: breakdown,
        details: details
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

