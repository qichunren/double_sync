let color = '#3aa757';

let current_window_id = 0;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  // console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.action.onClicked.addListener(async (tab) => {
  // console.log(`chrome.action.onClick, window.screen.width:${window.screen.width}`);
  // let [current_tab] = await chrome.tabs.query({ active: true, currentWindow: true });  
  console.log("chrome.action.onClick on current tab", tab);
  if(tab && tab.url.startsWith("http://") || tab.url.startsWith("https://")) {
    chrome.windows.getLastFocused({populate: false}, function(currentWindow) {
      console.log(currentWindow);
      console.log("2@@@@@@@@@@@@@@@@@@@@@@");
      let new_width = parseInt(currentWindow.width/2);
      chrome.windows.update(currentWindow.id, { top:currentWindow.top, left:0, width: new_width, state: "normal" }, function(){
        chrome.windows.create({focused:false, url: tab.url, width: new_width, left: currentWindow.left+new_width });
      });
    });
  }  
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  current_window_id = windowId;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   active: true
// audible: false
// autoDiscardable: true
// discarded: false
// favIconUrl: "https://l.ruby-china.com/photo/2016/c309db0b49cab85a32f756541ea0e2b0.png"
// groupId: -1
// height: 1329
// highlighted: true
// id: 58
// incognito: false
// index: 2
// mutedInfo: {muted: false}
// pinned: false
// selected: true
// status: "complete"
// title: "Ruby China"
// url: "https://ruby-china.org/"
// width: 1451
// windowId: 1
  if(changeInfo.status == "complete") {
    console.log(`chrome.tabs.onUpdated: tab(${tabId}), window:${tab.windowId}, url:${tab.url}`);
    current_window_id = tab.windowId;
    console.log("Current window id ", current_window_id);
  }

}); 

chrome.tabs.onActivated.addListener(function(activeInfo) {
 // how to fetch tab url using activeInfo.tabid
 chrome.tabs.get(activeInfo.tabId, function(tab){
  //console.log("onActivated:", tab);
 });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(sender.tab) {
      console.log(`Recv message from sender.tab:`, sender);
      current_window_id = sender.tab.windowId;
      console.log("------------- message ------------------");
      console.log(request);
      console.log("----------------------------------------");
      
      chrome.tabs.query({url: request.url}, function(tabs){
        
        if(tabs.length > 1) {
          chrome.action.setBadgeText({tabId: sender.tab.id, text: "1"}, function(){
            //console.table(tabs);
          });
          
          for(let i = 0;i < tabs.length;i++) {
            let a_tab = tabs[i];
            console.debug(`current window id:${current_window_id}, tag id:${a_tab.windowId}`);
            if(a_tab.windowId !== current_window_id) {
              // console.log("target tab:", tab);
              console.log(`Bridge message '${request.event}' to tab ${a_tab.id}`);
              chrome.tabs.sendMessage(a_tab.id, request, function(response) {
                // console.log(response.farewell);
              });
            }
          }
          
        } else {
          chrome.action.setBadgeText({tabId: sender.tab.id, text: "0"}, function(){
            
          });
        }
        
        
      });
      
    }
    
  }
);