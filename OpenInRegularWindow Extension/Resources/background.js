const CLOSE_PRIVATE_TAB_AFTER_OPEN = false;

async function switchTabPrivacyMode(tab) {
  try {
    if (!tab || !tab.url) {
      return;
    }

    const url = tab.url;

    const targetIncognito = !tab.incognito;

    const windows = await browser.windows.getAll({ populate: false });
    let targetWindow = windows.find(
      w => w.incognito === targetIncognito && w.type === "normal"
    );

    if (!targetWindow) {
      targetWindow = await browser.windows.create({
        url,
        incognito: targetIncognito,
        focused: true
      });
    } else {
      await browser.tabs.create({
        windowId: targetWindow.id,
        url,
        active: true
      });
      await browser.windows.update(targetWindow.id, { focused: true });
    }

    if (CLOSE_PRIVATE_TAB_AFTER_OPEN && tab.id != null) {
      await browser.tabs.remove(tab.id);
    }
  } catch (err) {
    console.error("Failed to toggle incognito mode:", err);
  }
}

browser.action.onClicked.addListener((tab) => {
  switchTabPrivacyMode(tab);
});
