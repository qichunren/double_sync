window.addEventListener('scroll', function(e) {
    chrome.runtime.sendMessage({url: window.location.href, scrolly: window.scrollY});
    
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
      console.log("RECV notify", request);
      window.scrollTo(0, request.scrolly);
        sendResponse();
    }
  );