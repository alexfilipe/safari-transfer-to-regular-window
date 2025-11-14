// background.js
const CLOSE_PRIVATE_TAB_AFTER_OPEN = false; // set to true if you want to auto-close the private tab

async function openInRegularWindowFromTab(tab) {
  try {
    if (!tab || !tab.url) {
      return;
    }

    const url = tab.url;

    // If we're already in a regular (non-incognito) window:
    if (!tab.incognito) {
      await browser.tabs.create({
        windowId: tab.windowId,
        url,
        active: true
      });
      return;
    }

    // We are in a private tab here.
    const windows = await browser.windows.getAll({ populate: false });
    let regularWindow = windows.find(w => !w.incognito && w.type === "normal");

    if (!regularWindow) {
      // No regular window exists: create one with this URL
      const newWindow = await browser.windows.create({
        url,
        incognito: false,
        focused: true
      });
      regularWindow = newWindow;
    } else {
      // Open new tab in existing regular window
      await browser.tabs.create({
        windowId: regularWindow.id,
        url,
        active: true
      });

      // Focus that window
      await browser.windows.update(regularWindow.id, { focused: true });
    }

    if (CLOSE_PRIVATE_TAB_AFTER_OPEN && tab.id != null) {
      await browser.tabs.remove(tab.id);
    }
  } catch (err) {
    console.error("Failed to open in regular window:", err);
  }
}

// Toolbar icon click
browser.action.onClicked.addListener((tab) => {
  openInRegularWindowFromTab(tab);
});

// Keyboard command
browser.commands.onCommand.addListener(async (command) => {
  if (command !== "open-in-regular-window") {
    return;
  }

  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true
  });

  if (activeTab) {
    openInRegularWindowFromTab(activeTab);
  }
});
