var pointer_clone = document.createElement("img");
pointer_clone.id = "double_sync_pointer";
pointer_clone.src = chrome.runtime.getURL("./images/arrow-pointer.png");
pointer_clone.style.position = "fixed";
pointer_clone.style.zIndex = 99999;
pointer_clone.style.left = "10px";
pointer_clone.style.top = "10px";
pointer_clone.style.display = "none";
document.body.appendChild(pointer_clone);

window.addEventListener('scroll', function(e) {  
  if(pointer_clone.style.display == "none") {
    chrome.runtime.sendMessage({event: "scroll", url: window.location.href, scrolly: window.scrollY});
  }
});

window.addEventListener('mousemove', function(e) {
  pointer_clone.style.display = "none";
  chrome.runtime.sendMessage({event: "mousemove", url: window.location.href, client_x: e.clientX, client_y: e.clientY});
});
  
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
      console.log("RECV notify", request);            
      pointer_clone.style.display = "block";
      if(request.event == "scroll") {
        window.scrollTo(0, request.scrolly);
      } else if(request.event == "mousemove") {                
        pointer_clone.style.left = "" + request.client_x + "px";
        pointer_clone.style.top = "" + request.client_y + "px";
        console.log("Force set pointer positoin");
      }

      sendResponse();
    }
  );