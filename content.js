window.addEventListener('scroll', function(e) {
    chrome.runtime.sendMessage({event: "scroll", url: window.location.href, scrolly: window.scrollY});
});

window.addEventListener('mousemove', function(e) {
  chrome.runtime.sendMessage({event: "mousemove", client_x: e.clientX, client_y: e.clientY});
});


  let img = document.createElement("img");
  img.id = "double_sync_pointer";
  img.src = chrome.runtime.getURL("./images/arrow-pointer.png");
  img.style.position = "fixed";
  img.style.zIndex = 99999;
  img.style.left = "10px";
  img.style.top = "10px";

  document.body.appendChild(img);
  console.log("Dom ready");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
      console.log("RECV notify", request);
      if(request.event == "scroll") {
        window.scrollTo(0, request.scrolly);
      } else if(request.event == "mousemove") {
        let pointer = document.getElementById("double_sync_pointer");
        pointer.style.left = "" + request.client_x + "px";
        pointer.style.top = "" + request.client_y + "px";

        console.log("Force set pointer positoin");
      }

      sendResponse();
    }
  );