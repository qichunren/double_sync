let current_window_id = 0;

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function mirror_tab_exist(url, self_win_id) {
  let queryOptions = { url: url};
  let tabs = await chrome.tabs.query(queryOptions);
  if(tabs.length < 2) {
    return false;
  } else {
    for(let i = 0;i < tabs.length;i++) {
      let a_tab = tabs[i];
      if(a_tab.windowId !== self_win_id) {
        return true;
      }
    }
    return false;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if(tab && tab.url.startsWith("http://") || tab.url.startsWith("https://")) {
    let has_mirror = await mirror_tab_exist(tab.url, current_window_id);
    if(has_mirror) {
      return;
    }

    chrome.windows.getLastFocused({populate: false}, function(currentWindow) {
      let new_width = parseInt(currentWindow.width/2);
      chrome.windows.update(currentWindow.id, { top:currentWindow.top, left:0, width: new_width, state: "normal" }, function(){
        chrome.windows.create({focused:false, url: tab.url, width: new_width, left: currentWindow.left+new_width });
      });
    });
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  current_window_id = windowId;
  let c_tab = await getCurrentTab();
  if(c_tab) {
    let has_mirror = await mirror_tab_exist(c_tab.url, windowId);
    console.log(`chrome.windows.onFocusChanged: has_mirror:${has_mirror} : ${windowId}, and current tab`, c_tab);
    if(has_mirror) {
      chrome.action.disable(c_tab.id);
    } else {
      chrome.action.enable(c_tab.id);
    }
  }

});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete") {
    console.log(`chrome.tabs.onUpdated: tab(${tabId}), window:${tab.windowId}, url:${tab.url}`);
    current_window_id = tab.windowId;
    console.log("Current window id ", current_window_id);
  }

});

chrome.tabs.onActivated.addListener(function(activeInfo) {
 // how to fetch tab url using activeInfo.tabid
 console.log(`chrome.tabs.onActivated: activeInfo:`, activeInfo);
 chrome.tabs.get(activeInfo.tabId, function(tab){
 });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(sender.tab) {
      // console.log(`Recv message from sender.tab:`, sender);
      current_window_id = sender.tab.windowId;
      //console.log("------------- message ------------------");
      //console.log(request);
      //console.log("----------------------------------------");

      chrome.tabs.query({url: request.url}, function(tabs){

        if(tabs.length > 1) {
          chrome.action.setBadgeText({tabId: sender.tab.id, text: "1"}, function(){
            //console.table(tabs);
          });

          for(let i = 0;i < tabs.length;i++) {
            let a_tab = tabs[i];
            if(a_tab.windowId !== current_window_id) {
              chrome.tabs.sendMessage(a_tab.id, request, function(response) {
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