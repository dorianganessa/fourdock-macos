// This adapter reads only the unread count already published in our page title.
module.exports = Ferdium => {
  const update = () => {
    if (window.location.origin !== 'http://127.0.0.1:4702') {
      Ferdium.setBadge(0, 0);
      return;
    }
    const match = document.title.match(/^\((\d+)\) Fourdock WhatsApp$/);
    const count = match ? Number(match[1]) : 0;
    Ferdium.setBadge(Number.isSafeInteger(count) ? count : 0, 0);
  };
  Ferdium.loop(update);
  update();
};
