/* Eğitsel metinlerle yazma pratiği; TXT ve Unicode uyumlu RTF dışa aktarımı. */
Bil.typing = (() => {
  let textIndex = 0, started = null, ended = null;
  const panel = document.getElementById('klavye');
  // Unicode karakterlerini ve konumsal eşleşmeleri sayarak doğruluk hesaplar.
  function measure(value,reference) {
    const typed = Array.from(value.replace(/\r\n/g,'\n')); const expected = Array.from(reference.replace(/\r\n/g,'\n'));
    const correct = typed.reduce((total,char,index) => total+(char === expected[index] ? 1 : 0),0);
    return {characters:typed.length,words:value.trim() ? value.trim().split(/\s+/u).length : 0,accuracy:typed.length ? correct/typed.length*100 : 100,complete:value === reference};
  }
  // Saniyeyi dakika:saniye biçimine çevirir.
  function clock(seconds) { return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
  // Kullanıcının metni ve geçen süre değiştikçe dört sayacı günceller.
  function update() {
    const editor = document.getElementById('typing-editor'); if (!editor) return;
    const result = measure(editor.value,Bil.data.typing[textIndex].text);
    document.getElementById('typing-characters').textContent = result.characters.toLocaleString('tr-TR');
    document.getElementById('typing-words').textContent = result.words.toLocaleString('tr-TR');
    document.getElementById('typing-accuracy').textContent = editor.value ? `%${result.accuracy.toLocaleString('tr-TR',{maximumFractionDigits:1})}` : '—';
    document.getElementById('typing-time').textContent = clock(started === null ? 0 : Math.floor(((ended ?? Date.now())-started)/1000));
    document.getElementById('typing-complete').hidden = !result.complete;
    panel.querySelectorAll('[data-download]').forEach(button => { button.disabled = !editor.value; });
  }
  // Aktif metnin başlığını ve referans içeriğini güvenli metin olarak gösterir.
  function showText() {
    const item = Bil.data.typing[textIndex];
    document.getElementById('typing-title').textContent = item.title;
    document.getElementById('typing-source').textContent = item.text;
    document.getElementById('typing-editor').value = ''; started = null; ended = null; update();
  }
  // Metni RTF sözdizimi ve işaretli UTF-16 kaçışları ile uyumlu hâle getirir.
  function rtf(value) {
    let body = '';
    const normalized = value.replace(/\r\n?/g,'\n');
    for (let index = 0; index < normalized.length; index++) {
      const char = normalized[index]; const code = normalized.charCodeAt(index);
      if (char === '\\' || char === '{' || char === '}') body += `\\${char}`;
      else if (char === '\n') body += '\\par\n';
      else if (char === '\t') body += '\\tab ';
      else if (code > 127) body += `\\u${code > 32767 ? code-65536 : code}?`;
      else if (code >= 32) body += char;
    }
    return `{\\rtf1\\ansi\\ansicpg1254\\deff0\\uc1{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 ${body}}`;
  }
  // Blob ve geçici indirme bağlantısıyla metni bilgisayara kaydeder.
  function download(format) {
    const value = document.getElementById('typing-editor').value; if (!value) return;
    const content = format === 'rtf' ? rtf(value) : `\ufeff${value}`;
    const blob = new Blob([content],{type:format === 'rtf' ? 'application/rtf' : 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `bilogren-metin-${textIndex+1}.${format}`; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000); Bil.toast(`${format.toUpperCase()} dosyanız indiriliyor. Tarayıcınızın indirmeler bölümünü kontrol edin.`);
  }
  // Yeni metne geçmeden veya yazıyı sıfırlamadan önce kullanıcıyı uyarır.
  async function change(index) {
    if (document.getElementById('typing-editor').value) {
      const yes = await Bil.modal('Yazma alanı temizlensin mi?','<p>Yazdığınız metin silinecek. Saklamak istiyorsanız önce TXT veya RTF olarak indirin.</p>',{cancel:true,ok:'Temizle ve devam et'});
      if (!yes) { document.getElementById('typing-select').value = textIndex; return; }
    }
    textIndex = index; document.getElementById('typing-select').value = index; showText(); document.getElementById('typing-editor').focus();
  }
  // Kaynak metin, editör, sayaç ve indirme düğmelerini kurar.
  function init() {
    panel.innerHTML = `<div class="module-intro"><p class="eyebrow">04 / Klavye egzersizi</p><h1>Yazarken tekrar edin.</h1><p class="muted">Üstteki metni aşağıdaki alana yazın. Acele etmeyin; önce doğruluğa, sonra hızınıza odaklanın.</p></div><div class="metrics"><div class="metric"><strong id="typing-characters">0</strong><span>Karakter (boşluklar dahil)</span></div><div class="metric"><strong id="typing-words">0</strong><span>Kelime</span></div><div class="metric"><strong id="typing-accuracy">—</strong><span>Doğruluk</span></div><div class="metric"><strong id="typing-time">00:00</strong><span>Geçen süre</span></div></div><div class="typing-layout"><div class="card"><h2 id="typing-title" style="font-size:22px"></h2><div id="typing-source" class="typing-source" tabindex="0" aria-label="Yazılacak kaynak metin"></div><label for="typing-editor">Sıra sizde — metni buraya yazın</label><textarea id="typing-editor" class="typing-editor" placeholder="Yukarıdaki metni yazmaya başlayın…" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-describedby="accuracy-help"></textarea><p id="typing-complete" class="notice" role="status" hidden>✓ Tebrikler! Metni eksiksiz ve doğru yazdınız.</p><p id="accuracy-help" class="muted small" style="margin-top:12px">Doğruluk, yazdığınız karakterlerin kaynak metindeki aynı konumla eşleşme oranıdır. Büyük/küçük harf, boşluk, noktalama ve satır sonları dikkate alınır. Bir eksik karakter sonraki eşleşmeleri de etkiler. Eksik kalan son bölüm doğruluk hesabına dahil değildir.</p></div><aside class="card typing-settings"><div><label for="typing-select">Alıştırma metni</label><select id="typing-select">${Bil.data.typing.map((item,index) => `<option value="${index}">${index+1}. ${Bil.escape(item.title)}</option>`).join('')}</select></div><div><h3>Yazdıklarınızı saklayın</h3><p class="muted">Metniniz yalnızca bu sayfa açıkken tutulur. Saklamak için bilgisayarınıza indirin.</p><button class="primary" data-download="txt" disabled>TXT olarak indir ↓</button><button data-download="rtf" style="margin-top:10px" disabled>RTF olarak indir ↓</button></div><button id="typing-reset" class="secondary">Yeniden başla</button><p class="muted">Türkçe karakterler iki biçimde de korunur. TXT saf metindir; RTF, 12 punto Arial yazıyla hazırlanır. Ölçümler resmî hız sınavı değildir.</p></aside></div>`;
    showText();
    document.getElementById('typing-editor').addEventListener('input',event => {
      if (event.target.value && started === null) started = Date.now();
      if (!event.target.value) { started = null; ended = null; }
      const complete = event.target.value === Bil.data.typing[textIndex].text;
      ended = complete ? (ended ?? Date.now()) : null; update();
    });
    document.getElementById('typing-select').addEventListener('change',event => change(Number(event.target.value)));
    document.getElementById('typing-reset').onclick = () => change(textIndex);
    panel.addEventListener('click',event => { const button = event.target.closest('[data-download]'); if (button) download(button.dataset.download); });
    setInterval(() => { if (started !== null && ended === null) update(); },1000);
  }
  return {init,measure,rtf};
})();
