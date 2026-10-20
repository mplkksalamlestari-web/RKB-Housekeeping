/* Penghubung ke server Apps Script (lihat Api.gs). */
(function () {
  var cfg = window.HK_CONFIG || {};
  try { var o = localStorage.getItem('hk_api_url'); if (o) cfg.API_URL = o; } catch (e) {}   // alamat yang diisi lewat "Pengaturan server" di layar login
  window.hkCall = async function (fn, args) {
    if (!cfg.API_URL || /PASTE/.test(cfg.API_URL)) throw new Error('Alamat server belum diisi. Buka "Pengaturan server" di layar login.');
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 90000);
    var res;
    try {
      // text/plain agar browser tidak mengirim preflight CORS (Apps Script tidak menjawab preflight)
      res = await fetch(cfg.API_URL, {
        method: 'POST', redirect: 'follow', signal: ctrl.signal,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ fn: fn, args: args })
      });
    } catch (e) {
      throw new Error(e && e.name === 'AbortError' ? 'Server terlalu lama menjawab. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa sinyal internet dan alamat server.');
    } finally { clearTimeout(timer); }
    var data;
    try { data = await res.json(); }
    catch (e) { throw new Error('Balasan server tidak dikenali. Pastikan deploy Apps Script memakai versi terbaru, akses "Siapa saja", dan alamat server benar.'); }
    if (!data.ok) throw new Error(data.error || 'Terjadi kesalahan di server.');
    return data.data;
  };
})();
