function get_info() {

    var event_title = document.getElementsByClassName("_5gmx")[0].innerHTML;
    var date = document.getElementsByClassName("_2ycp _5xhk")[0].getAttribute("content");
    
    // location is the second element with this class name.
    var location = document.getElementsByClassName("_5xhp fsm fwn fcg")[1].innerHTML;
    var start_time; var end_time;
    
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
          + "\nlocation = " + location);
}

setTimeout(get_info, 5000);
