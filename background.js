// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var cmSendToCalendar = chrome.contextMenus.create({ 
    "title": "Save The Event!", 
    "contexts": ["all"], 
    "id": "test_id",
    "documentUrlPatterns": ["https://www.facebook.com/events/*/"]
});

chrome.contextMenus.onClicked.addListener(
    
    function(info, tab) {
        var regex = RegExp('facebook.com/events/[0-9]*/')
        
        // only run if at the correct URL
        if (regex.test(tab.url)) {
            SendToCalendar(tab);
        }
    })

function SendToCalendar(tab) {
    var maxLength = 1600;
    
    // TODO: Fill in stubs dynamically from chrome.storage
    var address = "20 Monroe Ave NW, Grand Rapids, Michigan 49503"
    var title = "Clean Comedy Time Showcase at Dr Grins"
    var start = "2019-06-12T17:00:00-07:00"
    var end = "2019-06-12T18:30:00-07:00"
    //--END TODO--
    
    
    // times are formatted YYYYMMDDTHHMMssZ, where T and Z are unchanged...
    // clip end of start and end
    start = start.substring(0, 19);
    end = end.substring(0, 19);
    
    // remove all dashes and colons
    start = start.replace(/-/g, "");
    start = start.replace(/:/g, "") + "Z";
    end = end.replace(/-/g, "");
    end = end.replace(/:/g, "") + "Z";
        
    // build url
    var url = "http://www.google.com/calendar/event?action=TEMPLATE";
    url += "&text=" + TrimURITo(title, maxLength - url.length);
    url += "&location=" + TrimURITo(address, maxLength - url.length);
    url += "&details=" + TrimURITo(tab.url + "\n", maxLength - url.length);
    url += "&dates=" + TrimURITo(start + "/" + end, maxLength - url.length);
    
    // Open the created url in a new tab
	chrome.tabs.create({ "url": url}, function (tab) {});
    
}

// Trim text so that its URI encoding fits into the length limit
// and return its URI encoding
function TrimURITo(text, length) {
    var textURI = encodeURI(text);
    if (textURI.length > length) {
        // Different charsets can lead to a different blow-up after passing the
        // text through encodeURI, so let's estimate the blow up first,
        // and then trim the text so that it fits the limit...
        var blowUp = textURI.length/text.length;
        var newLength = Math.floor(length / blowUp) - 3;  // -3 for "..."
        do {
            // trim the text & show that it was trimmed...
            text = text.substring(0, newLength) + "...";
            textURI = encodeURI(text);
            newLength = Math.floor(0.9 * newLength);
        } while (textURI.length > length);
    }

    return textURI;
}

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
      actions: [
          new chrome.declarativeContent.ShowPageAction()]
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

function storeData(data) {
  key = "calData"
  alert("in storedata")
  chrome.storage.local.set({key: data}, function(){
      console.log("StoreData running");
  })
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("in background.js")
    //alert(sender.tab ?
    //            "from a content script:" + sender.tab.url :
    //            "from the extension");
    sendResponse({"hello": "world"});
    chrome.storage.sync.set({"calData": request}, function(){alert("set storage")})
    //console.log(chrome.storage);
  });

  