/* Membuat kode aplikasi yang sama (Index.html) bisa berjalan di Netlify:
   meniru google.script.run milik Apps Script, lalu meneruskan setiap panggilan ke server lewat api.js. */
(function () {
  if (window.google && window.google.script && window.google.script.run) return;   // di dalam Apps Script: tidak perlu
  function runner(onOk, onFail) {
    return new Proxy({}, {
      get: function (_t, prop) {
        if (prop === 'withSuccessHandler') return function (h) { return runner(h, onFail); };
        if (prop === 'withFailureHandler') return function (h) { return runner(onOk, h); };
        if (prop === 'withUserObject') return function () { return runner(onOk, onFail); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          window.hkCall(String(prop), args).then(
            function (r) { if (onOk) onOk(r); },
            function (e) { if (onFail) onFail({ message: e && e.message ? e.message : String(e) }); else console.error(e); }
          );
        };
      }
    });
  }
  window.google = { script: { run: runner(null, null), host: {} } };
})();
