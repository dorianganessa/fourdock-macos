chrome.runtime.sendMessage({ type: 'launch' }).then(async result => {
  if (result?.error) { document.querySelector('p').textContent = result.error; return; }
  const tab = await chrome.tabs.getCurrent();
  if (tab) chrome.tabs.remove(tab.id);
});
