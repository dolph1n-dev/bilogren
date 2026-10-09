/* Ortak yardımcılar; ağ isteği yapmadan yalnızca tarayıcıda çalışır. */
window.Bil = (() => {
  const storageKey = 'bilogren.v1.';
  let toastTimer;
  let dialogResolve;
  // Metni HTML içine güvenli yerleştirmek için özel karakterleri kaçırır.
  function escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  // Ekran okuyucuların da duyabildiği kısa durum mesajını gösterir.
  function toast(message) {
    const box = document.getElementById('toast');
    clearTimeout(toastTimer); box.textContent = message; box.hidden = false;
    toastTimer = setTimeout(() => { box.hidden = true; }, 4800);
  }
  // Depolama izni yoksa uygulamayı durdurmadan güvenli varsayılanı döndürür.
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(storageKey + key)) ?? fallback; }
    catch { return fallback; }
  }
  // LocalStorage hatalarını yakalar ve kaydın başarısını bildirir.
  function write(key, value) {
    try { localStorage.setItem(storageKey + key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  // Sadece uygulamanın ilgili kaydını siler; diğer sitelerin verilerine dokunmaz.
  function remove(key) { try { localStorage.removeItem(storageKey + key); } catch { /* Depolama kapalı olabilir. */ } }
  // Boyutu başlangıç seviyesi kullanıcı için okunaklı birime çevirir.
  function size(bytes) {
    if (bytes < 1024) return `${bytes} bayt`;
    const units = ['KB', 'MB', 'GB']; let number = bytes / 1024; let index = 0;
    while (number >= 1024 && index < 2) { number /= 1024; index++; }
    return `${new Intl.NumberFormat('tr-TR', {maximumFractionDigits: 1}).format(number)} ${units[index]}`;
  }
  // Aynı anda tek erişilebilir iletişim kutusu açar; odak yerini tarayıcı korur.
  function modal(title, html, options = {}) {
    if (dialogResolve) return Promise.resolve(null);
    const dialog = document.getElementById('app-dialog');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-body').innerHTML = html;
    document.getElementById('dialog-actions').innerHTML = `${options.cancel ? '<button value="cancel" type="submit" class="secondary">Vazgeç</button>' : ''}<button value="ok" type="submit" class="${options.danger ? 'danger' : 'primary'}">${escape(options.ok || 'Tamam')}</button>`;
    const form = document.getElementById('dialog-form');
    // Formun seçilen düğmesini ve varsa metin değerini çözüme dönüştürür.
    form.onsubmit = event => {
      event.preventDefault();
      const input = form.querySelector('input');
      const accepted = event.submitter?.value === 'ok';
      dialog.close(); const resolve = dialogResolve; dialogResolve = null;
      resolve(accepted ? (input ? input.value : true) : null);
    };
    // Escape veya kapatma düğmesini iptal sonucu olarak işler.
    dialog.oncancel = () => { const resolve = dialogResolve; dialogResolve = null; resolve?.(null); };
    document.getElementById('dialog-x').onclick = () => {
      dialog.close(); const resolve = dialogResolve; dialogResolve = null; resolve?.(null);
    };
    return new Promise(resolve => {
      dialogResolve = resolve; dialog.showModal();
      const input = form.querySelector('input');
      if (input) { input.focus(); input.select(); }
    });
  }
  // Yeni ad veya klasör adı almak için doğrulamalı metin penceresi hazırlar.
  function input(title, value = '') {
    return modal(title, `<label for="name-input">Ad</label><input id="name-input" name="name" required maxlength="80" autocomplete="off" value="${escape(value)}"><p class="muted">Dosya uzantısını (ör. .docx) koruyun. / \\ : * ? &quot; &lt; &gt; | kullanmayın.</p>`, {cancel:true, ok:'Kaydet'});
  }
  return {escape, toast, read, write, remove, size, modal, input};
})();
