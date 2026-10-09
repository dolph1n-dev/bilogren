/* Konu kartlarını ve aranabilir kısayol tablosunu yönetir. */
Bil.lessons = (() => {
  const e = Bil.escape;
  // Arama terimini Türkçe büyük/küçük harf kurallarına göre normalleştirir.
  function normalize(value) { return value.toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim(); }
  // Kısayol, işlem adı ve açıklama üzerinden tabloyu filtreler.
  function filterShortcuts(term = '') {
    const rows = Bil.data.shortcuts.filter(row => normalize(row.join(' ')).includes(normalize(term)));
    document.getElementById('shortcut-rows').innerHTML = rows.length ? rows.map(row => `<tr><td><kbd>${e(row[0])}</kbd></td><td><strong>${e(row[1])}</strong></td><td>${e(row[2])}</td></tr>`).join('') : '<tr><td colspan="3">Sonuç bulunamadı. “kopyala” veya “Ctrl” gibi bir kelime deneyin.</td></tr>';
    document.getElementById('shortcut-count').textContent = `${rows.length} kısayol gösteriliyor`;
  }
  // Modülün erişilebilir konu, donanım ve uzantı kartlarını bir kez oluşturur.
  function init() {
    document.getElementById('konular').innerHTML = `
      <div class="hero"><div><p class="eyebrow">Bilgisayara ilk adım</p><h1>Bilgisayarı öğrenin.<br>Güvenle pratik yapın.</h1><p>Teknik terimleri ezberlemeden, günlük örneklerle öğrenin. Kendi hızınızda ilerleyin; her adımda birlikteyiz.</p><div class="hero-actions"><button class="primary" id="start-learning">Öğrenmeye başla ↓</button><button data-go="pratik">Pratik alanını keşfet →</button></div></div><aside class="hero-card"><h2 style="font-size:20px">Nasıl ilerleyebilirim?</h2><div class="journey"><div><span class="step-num">1</span><p><strong>Önce tanıyın</strong>Kartlarla temel kavramları öğrenin.</p></div><div><span class="step-num">2</span><p><strong>Sonra deneyin</strong>Sanal dosyalarla güvenle çalışın.</p></div><div><span class="step-num">3</span><p><strong>Kendinizi sınayın</strong>Açıklamalarla eksiklerinizi tamamlayın.</p></div></div></aside></div>
      <div class="notice">Bu eğitim ücretsizdir. Sınav kayıtları yalnızca izin verirseniz bu tarayıcıda tutulur; kişisel bilgileriniz gönderilmez.</div>
      <div class="section-heading" id="baslangic"><h2>Temelleri birlikte keşfedelim</h2><span class="muted small">Ayrıntıları açmak için kartlara tıklayın.</span></div>
      <div class="grid-3">
        <article class="card"><span class="topic-icon" aria-hidden="true">01</span><h3>Donanım mı, yazılım mı?</h3><p>Donanım bilgisayarın dokunabildiğiniz parçalarıdır. Yazılım bu parçalara ne yapacağını söyleyen programlardır.</p><details><summary>Örneklerle öğren</summary><p><strong>Donanım:</strong> Klavye, fare, monitör, işlemci. Bir mutfağın araç gereçleri gibi.</p><p><strong>Yazılım:</strong> Windows, Linux, ofis programları, tarayıcı. Araç gereçleri nasıl kullanacağımızı anlatan tarifler gibi.</p><p>İşletim sistemi donanımı yönetir; uygulamalar yazı yazma, hesaplama ve internete girme gibi işleri yapar.</p></details></article>
        <article class="card"><span class="topic-icon" aria-hidden="true">02</span><h3>Dosya ve klasör düzeni</h3><p>Dosya bir belge veya fotoğraftır. Klasör, dosyalarınızı grupladığınız bir çekmece gibidir.</p><details><summary>Yolu ve hiyerarşiyi öğren</summary><p>Boş alana sağ tıklayıp <strong>Yeni Klasör</strong> seçin. Klasöre açıklayıcı bir ad verin. Alt klasörleri kullanarak düzen kurun.</p><p class="path-example">Masaüstü → Belgeler → Rapor.docx</p><p>Bu yol, Rapor.docx dosyasının Belgeler içinde olduğunu gösterir. Windows yollarında aralara \\ yazılır. Aynı klasörde aynı adlı iki öğe bulunamaz.</p></details></article>
        <article class="card"><span class="topic-icon" aria-hidden="true">03</span><h3>Dosyanız ne kadar büyük?</h3><p>Boyut, dosyanın depolamada kapladığı yerdir. Küçükten büyüğe: KB → MB → GB.</p><details><summary>Boyutları karşılaştır</summary><p>Kısa bir not birkaç KB, fotoğraf birkaç MB, uzun video ise GB düzeyinde olabilir.</p><p>Bu eğitimdeki boyut hesaplarında 1 MB = 1024 KB, 1 GB = 1024 MB kabul edilir. Üreticiler ondalık hesap da kullanabilir.</p><p><strong>Özellikler</strong> komutuyla boyutu kontrol edin. Dosyanın uzantısı tek başına boyutunu belirlemez.</p></details></article>
      </div>
      <div class="section-heading"><h2>Bilgisayarın içini tanıyalım</h2><span class="muted small">Her parçanın farklı bir görevi var.</span></div>
      <div class="card hardware-list">${Bil.data.hardware.map(([title,text]) => `<div><strong>${e(title)}</strong><p>${e(text)}</p></div>`).join('')}</div>
      <div class="section-heading"><div><h2>Klavye kısayolları</h2><p class="muted small" style="margin:8px 0 0">Windows ve yaygın ofis programları için.</p></div><div class="search-box"><label for="shortcut-search">Kısayol ara</label><input id="shortcut-search" type="search" placeholder="Örn. kopyala, Ctrl, kaydet"></div></div>
      <p id="shortcut-count" class="muted small" role="status"></p><div class="table-wrap"><table><caption class="sr-only">Klavye kısayolları ve görevleri</caption><thead><tr><th scope="col">Kısayol</th><th scope="col">İşlem</th><th scope="col">Ne işe yarar?</th></tr></thead><tbody id="shortcut-rows"></tbody></table></div>
      <div class="section-heading"><h2>Dosya uzantılarını keşfedin</h2><span class="muted small">Açmak için bir kart seçin.</span></div><div class="extensions">${Bil.data.extensions.map(([extension,type],index) => `<button class="extension" data-extension="${index}"><strong>${extension}</strong><span>${e(type)} • Ayrıntıyı aç</span></button>`).join('')}</div>
      <p class="muted small" style="margin-top:18px">ZIP bir arşivdir, EXE ise çalıştırılabilir programdır. Uzantıyı değiştirmek dosyayı başka biçime dönüştürmez.</p>`;
    filterShortcuts();
    document.getElementById('shortcut-search').addEventListener('input', event => filterShortcuts(event.target.value));
    document.getElementById('start-learning').onclick = () => document.getElementById('baslangic').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    document.getElementById('konular').addEventListener('click', event => {
      const button = event.target.closest('[data-extension]'); if (!button) return;
      const [extension,type,program,description] = Bil.data.extensions[Number(button.dataset.extension)];
      Bil.modal(`${extension} — ${type}`, `<p>${e(description)}</p><div class="feedback"><strong>Hangi programla açılır?</strong><p style="margin:8px 0 0">${e(program)}</p></div><p class="muted small">Dosyanın güvenilir kaynaktan geldiğini kontrol edin. Uyumlu program yoksa açılmayabilir.</p>`);
    });
  }
  return {init};
})();
