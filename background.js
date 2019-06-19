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
            // run scraping script, then call SendToCalendar
            chrome.tabs.executeScript(
                null, // tabID
                {file: "contentScript.js"}, // details of script
                function(result){SendToCalendar(tab)} // callback, send to calendar!
            )
        }
    })

function pad(n) {
	return n<10 ? '0'+n : n
}

function SendToCalendar(tab) {
    var maxLength = 2000;
            
    // start building the URL
    var url = "http://www.google.com/calendar/event?action=TEMPLATE";
    
    chrome.storage.sync.get("calData", function(response){
      
      var address = response.calData.address;
      var title = response.calData.title;
      var details = response.calData.details;
        
      // remove emojis from details
      var ranges = [
        '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
        '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
        '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
      ];
      //details = details.replace(new RegExp("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*", 'g'), '');
        
      // original time-date format: YYYY-MM-DDTHH:MM:ss-ZZ:ZZ
      var start = new Date(response.calData.start);
      var end = new Date(response.calData.end);
    
      // times must be formatted YYYYMMDDTHHMMssZ, UTC
      var start_formatted = String(start.getUTCFullYear()) + pad(start.getUTCMonth()) + pad(start.getUTCDate()) 
            + 'T' + pad(start.getUTCHours()) + pad(start.getUTCMinutes()) + pad(start.getUTCSeconds()) + 'Z';
      var end_formatted = String(end.getUTCFullYear()) + pad(end.getUTCMonth()) + pad(end.getUTCDate()) 
            + 'T' + pad(end.getUTCHours()) + pad(end.getUTCMinutes()) + pad(end.getUTCSeconds()) + 'Z';
        
      // build url
      url += "&text=" + TrimURITo(title, maxLength - url.length);
      url += "&location=" + TrimURITo(address, maxLength - url.length);
      url += "&details=" + TrimURITo("Facebook Event: " + tab.url + "\n\nDetails:\n" + details, maxLength - url.length);
      
      // dont trim dates portion
      url += "&dates=" + start_formatted + "/" + end_formatted;
      
      // Open the created url in a new tab
      chrome.tabs.create({"url": url}, function (tab) {});
    })
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
        /*chrome.tabs.executeScript(
            details={file: "contentScript.js"}
        );*/
    }
)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("in background.js")
//    alert(sender.tab ?
//               "from a content script:" + sender.tab.url :
//                "from the extension");
    sendResponse({"hello": "world"});
    chrome.storage.sync.set({"calData": request}, function(){})
    //console.log(chrome.storage);
  });

  