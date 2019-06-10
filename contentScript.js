function get_info() {

    var event_title = document.getElementsByClassName("_5gmx")[0].innerHTML;
    var date = document.getElementsByClassName("_2ycp _5xhk")[0].getAttribute("content");
    
    // location is the second element with this class name.
    var street = document.getElementsByClassName("_5xhp fsm fwn fcg")[1].innerHTML;
    var location_name = document.getElementsByClassName("_5xhk")[1].innerHTML; 
    var start_time; var end_time;
    var details = document.getElementsByClassName("_63ew")[0].innerHTML;
    
    // remove span tags and replace break tags with new line characters
    details = details.replace("<span>", "");
    details = details.replace("</span>", "");
    details = details.replace(/<br>/g, "\n")
        
    // if end time
    if (date.includes("to")) {
        // split on " to "
        date_split = date.split(" to ");
        start_time = date_split[0];
        end_time = date_split[1];
    }
    // no end time specified
    else {
        start_time = date;
        end_time = date;
    }
    
    console.log("start = " + start_time 
          + "\nend = " + end_time
          + "\ntitle = " + event_title
          + "\nlocation = " + location_name
          + "\n address  = " + street);

    data = {
        "start": start_time,
        "end": end_time,
        "title": event_title,
        "location": location_name,
        "address": street,
        "details": details
    }

    chrome.runtime.sendMessage(data, function(response) {
        console.log("Content Script message function response:")
        console.log(response);
      });

}

var _url = window.location.href
var regex = RegExp('facebook.com/events/[0-9]*/')

// only run if at the correct URL
if (regex.test(_url)) {
    console.log("running get_info");
    setTimeout(get_info, 500);
}
