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
    var maxLength = 2000;
            
    // start building the URL
    var url = "http://www.google.com/calendar/event?action=TEMPLATE";
    
    chrome.storage.sync.get("calData", function(response){
      
      var address = response.calData.address;
      var title = response.calData.title;
      var details = response.calData.details;
      
      // original time-date format: YYYY-MM-DDTHH:MM:ss-ZZ:ZZ
      var start = response.calData.start;
      var end = response.calData.end;
      
      // change start-time to EST
      var start_time = start.split('T')[1];
      var start_hour = start_time.split(':')[0];
      var ss_and_ZZ = start_time.split(':')[2];
      var ZZ = ss_and_ZZ.substring(2);
      var start_hour_est = parseInt(start_hour) - parseInt(ZZ);
      start = start.replace("T" + start_hour, "T" + start_hour_est);
      
      // change end-time to EST
      var end_time = end.split('T')[1];
      var end_hour = end_time.split(':')[0];
      var end_hour_est = parseInt(end_hour) - parseInt(ZZ);
      end = end.replace("T" + end_hour, "T" + end_hour_est);
            
      // times must be formatted YYYYMMDDTHHMMssZ, where T and Z are unchanged...
      // clip end of start and end
      start = start.substring(0, 19);
      end = end.substring(0, 19);
      
      // remove all dashes and colons, add Z for time-zone
      start = start.replace(/-/g, "");
      start = start.replace(/:/g, "") + "Z";
      end = end.replace(/-/g, "");
      end = end.replace(/:/g, "") + "Z";
          
      // build url
      url += "&text=" + TrimURITo(title, maxLength - url.length);
      url += "&location=" + TrimURITo(address, maxLength - url.length);
      url += "&details=" + TrimURITo("Facebook Event: " + tab.url + "\n\nDetails:\n" + details, maxLength - url.length);
      url += "&dates=" + TrimURITo(start + "/" + end, maxLength - url.length);
      
      // Open the created url in a new tab
      chrome.tabs.create({ "url": url}, function (tab) {});
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
        chrome.tabs.executeScript(
            details={file: "contentScript.js"}
        );
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

  