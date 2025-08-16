// Shows early runtime errors before React mounts (so we don't see a blank screen)
function show(msg: string) {
  const el = document.createElement('pre');
  el.style.cssText =
    'position:fixed;inset:12px;z-index:99999;padding:12px;border-radius:8px;' +
    'background:rgba(0,0,0,.7);color:#ffb4b4;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;';
  el.textContent = msg;
  document.body.appendChild(el);
}

window.addEventListener('error', (e) => show(`Uncaught error:\\n${e.message}\\n${e.filename}:${e.lineno}`));
window.addEventListener('unhandledrejection', (e: any) => show(`Unhandled promise rejection:\\n${e?.reason || e}`));
