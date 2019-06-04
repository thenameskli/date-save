// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlMatches: 'www.facebook.com/events/[0-9]*/',
        },
      }), ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
  
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
    function(details) {
        chrome.tabs.executeScript(
            details={file: "contentScript.js"}
        );
    }
)