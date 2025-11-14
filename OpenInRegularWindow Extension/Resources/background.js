// background.js
const CLOSE_PRIVATE_TAB_AFTER_OPEN = false; // set to true if you want to auto-close the private tab

async function openInRegularWindowFromTab(tab) {
  try {
    if (!tab || !tab.url) {
      return;
    }

    const url = tab.url;

    if (!tab.incognito) {
      await browser.tabs.create({
        windowId: tab.windowId,
        url,
        active: true
      });
      return;
    }

    const windows = await browser.windows.getAll({ populate: false });
    let regularWindow = windows.find(w => !w.incognito && w.type === "normal");

    if (!regularWindow) {
      const newWindow = await browser.windows.create({
        url,
        incognito: false,
        focused: true
      });
      regularWindow = newWindow;
    } else {
      await browser.tabs.create({
        windowId: regularWindow.id,
        url,
        active: true
      });
      await browser.windows.update(regularWindow.id, { focused: true });
    }

    if (CLOSE_PRIVATE_TAB_AFTER_OPEN && tab.id != null) {
      await browser.tabs.remove(tab.id);
    }
  } catch (err) {
    console.error("Failed to open in regular window:", err);
  }
}

browser.action.onClicked.addListener((tab) => {
  openInRegularWindowFromTab(tab);
});
