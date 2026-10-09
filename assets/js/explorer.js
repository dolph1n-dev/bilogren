/* Windows benzeri eğitim gezgini: tüm işlemler yalnızca modüler VFS durumuna uygulanır. */
Bil.explorer = (() => {
  const e = Bil.escape;
  const panel = document.getElementById('pratik');
  let vfs, tasks, scenarioIndex = 0, current = 'root', selected = [], clipboard = null, history = [], historyIndex = -1, announced = false;
  // Senaryoyu baştan kurar; seçim, pano, geçmiş ve çöp kutusunu sıfırlar.
  function reset(index) {
    scenarioIndex = index; vfs = new Bil.VFS(Bil.scenarios[index].tree); tasks = Bil.tasks.prepare(vfs,Bil.scenarios[index]);
    current = 'root'; selected = []; clipboard = null; history = ['root']; historyIndex = 0; announced = false;
    render();
  }
  // Etkin klasörü veya kutuyu gösterir; gezinti geçmişini gerektiğinde günceller.
  function navigate(id,record = true) {
    if (id !== 'bin' && vfs.get(id)?.type !== 'folder') return;
    current = id; selected = [];
    if (record && history[historyIndex] !== id) { history = history.slice(0,historyIndex+1); history.push(id); historyIndex++; }
    render(true);
  }
  // Silinmiş konumları atlayarak gezinti geçmişinde geriye gider.
  function back() {
    while (historyIndex > 0) { historyIndex--; const id = history[historyIndex]; if (id === 'bin' || vfs.get(id)) { navigate(id,false); return; } }
  }
  // Bir öğenin dosya türünü açıklayıcı Türkçe etiketle döndürür.
  function type(node) {
    if (node.type === 'folder') return 'Klasör';
    const extension = `.${node.name.split('.').pop().toLowerCase()}`;
    const entry = Bil.data.extensions.find(item => item[0] === extension);
    return entry ? `${entry[1]} (${extension})` : 'Dosya';
  }
  // Öğeye türüne göre simge atar; erişilebilir ad metinde ayrıca bulunur.
  function icon(node) {
    if (node.type === 'folder') return '📁';
    if (/\.(png|jpg)$/i.test(node.name)) return '🖼️';
    if (/\.xlsx$/i.test(node.name)) return '📊';
    if (/\.mp3$/i.test(node.name)) return '🎵';
    if (/\.mp4$/i.test(node.name)) return '🎞️';
    if (/\.zip$/i.test(node.name)) return '🗜️';
    if (/\.exe$/i.test(node.name)) return '⚙️';
    return '📄';
  }
  // Mevcut klasörde veya kutuda gösterilecek kök öğeleri döndürür.
  function visible() { return current === 'bin' ? vfs.bin.map(entry => entry.nodes.find(node => node.id === entry.id)) : vfs.children(current); }
  // İşlem düğmelerinin mevcut seçime ve panoya göre kullanılabilirliğini belirler.
  function enabled(action) {
    const count = selected.length;
    if (action === 'open') return count === 1 && current !== 'bin';
    if (action === 'paste') return current !== 'bin' && !!clipboard;
    if (action === 'new') return current !== 'bin';
    if (action === 'restore' || action === 'empty') return current === 'bin' && (action === 'empty' ? vfs.bin.length > 0 : count > 0);
    if (action === 'rename' || action === 'properties') return count === 1 && (action === 'properties' || current !== 'bin');
    if (action === 'delete' || action === 'permanent') return count > 0;
    return current !== 'bin' && count > 0;
  }
  // Araç çubuğu ve bağlam menüsünün ortak işlem düğmesini üretir.
  function actionButton(action,label) { return `<button data-action="${action}" ${enabled(action) ? '' : 'disabled'}>${label}</button>`; }
  // Dosya listesi, yol, görev paneli ve araç çubuğunu güncel durumdan oluşturur.
  function render(focus = false) {
    if (current !== 'bin' && !vfs.get(current)) current = 'root';
    const entries = visible(); selected = selected.filter(id => entries.some(node => node.id === id));
    const scenario = Bil.scenarios[scenarioIndex]; const trail = current === 'bin' ? [] : vfs.trail(current);
    panel.innerHTML = `<div class="module-intro"><p class="eyebrow">03 / Masaüstü pratik</p><h1>Deneyerek öğrenin.</h1><p class="muted">Dosya taşıma, kopyalama ve silme işlemlerini gerçek hayattan görevlerle deneyin. Bu alan bir eğitim simülasyonudur; bilgisayarınızdaki dosyalara dokunmaz.</p></div><div class="sim-layout"><aside class="card scenario-panel"><label for="scenario-select">Bir senaryo seçin</label><select id="scenario-select">${Bil.scenarios.map((item,index) => `<option value="${index}" ${scenarioIndex === index ? 'selected' : ''}>${index+1}. ${e(item.title)}</option>`).join('')}</select><h2>${e(scenario.title)}</h2><p class="muted small">${e(scenario.description)}</p><ol class="task-list" id="task-list"></ol><p class="scenario-progress" id="scenario-progress" role="status"></p><button id="scenario-reset">Senaryoyu baştan başlat</button><p class="muted small" style="margin-top:16px">Yeşil adımlar otomatik kontrol edilir. İşlemi geri değiştirirseniz ilgili işaret de güncellenir. Senaryo değişimi ve sayfa yenileme pratiği sıfırlar.</p></aside><div><div class="explorer" id="explorer-window" tabindex="0" role="region" aria-label="Sanal Dosya Gezgini"><div class="window-title"><strong>📁 Dosya Gezgini <span class="muted">/ Eğitim alanı</span></strong><span class="window-dots" aria-hidden="true">─　□　×</span></div><div class="explorer-toolbar">${actionButton('open','Aç')}${actionButton('new','Yeni Klasör')}${actionButton('copy','Kopyala')}${actionButton('cut','Kes')}${actionButton('paste','Yapıştır')}${actionButton('rename','Adlandır')}${actionButton('delete',current === 'bin' ? 'Kalıcı Sil' : 'Sil')}${current === 'bin' ? actionButton('restore','Geri Yükle') + actionButton('empty','Kutuyu Boşalt') : ''}${actionButton('properties','Özellikler')}</div><div class="address-row"><button id="explorer-back" aria-label="Gezinti geçmişinde geri" ${historyIndex === 0 ? 'disabled' : ''}>←</button><button id="explorer-up" aria-label="Üst klasöre çık" ${current === 'root' || current === 'bin' ? 'disabled' : ''}>↑</button><label for="explorer-address" class="sr-only">Klasör adresi; Enter ile açın</label><input id="explorer-address" value="${e(current === 'bin' ? 'Geri Dönüşüm Kutusu' : trail.map(node => node.name).join('\\'))}" ${current === 'bin' ? 'readonly' : ''} title="Masaüstü\\Klasör biçiminde yol yazın ve Enter’a basın."></div><div class="explorer-main"><nav class="explorer-sidebar" aria-label="Sanal klasörler"><button data-folder="root" class="${current === 'root' ? 'active' : ''}">Masaüstü</button>${vfs.children('root').filter(node => node.type === 'folder').map(node => `<button data-folder="${node.id}" class="${current === node.id ? 'active' : ''}">${e(node.name)}</button>`).join('')}<button data-folder="bin" class="${current === 'bin' ? 'active' : ''}">Geri Dönüşüm Kutusu (${vfs.bin.length})</button></nav><div class="file-area" id="file-area"><div class="breadcrumbs" aria-label="Geçerli konum">${current === 'bin' ? '<strong>Geri Dönüşüm Kutusu</strong>' : trail.map((node,index) => `${index ? '<span aria-hidden="true">›</span>' : ''}<button data-folder="${node.id}">${e(node.name)}</button>`).join('')}</div><div class="files" id="file-list">${entries.length ? entries.map(node => `<button class="file-item ${selected.includes(node.id) ? 'selected' : ''} ${clipboard?.mode === 'cut' && clipboard.ids.includes(node.id) ? 'cut' : ''}" data-file="${node.id}" aria-pressed="${selected.includes(node.id)}" aria-label="${e(node.name)}, ${e(type(node))}"><span class="file-icon" aria-hidden="true">${icon(node)}</span><span>${e(node.name)}</span><span class="type-tag">${e(node.type === 'folder' ? 'Klasör' : node.name.split('.').pop().toUpperCase())}</span></button>`).join('') : `<p class="empty">${current === 'bin' ? 'Geri Dönüşüm Kutusu boş.' : 'Bu klasör boş. Sağ tıklayın veya “Yeni Klasör” düğmesini kullanın.'}</p>`}</div></div></div><div class="explorer-status" id="explorer-status" role="status"></div></div><div class="notice sim-help">Bir kez tıkla: seç. Çift tıkla veya Enter: klasörü aç. Sağ tıkla ya da Shift+F10: menüyü aç.<br><kbd>Ctrl+C</kbd> kopyala • <kbd>Ctrl+X</kbd> kes • <kbd>Ctrl+V</kbd> yapıştır • <kbd>Delete</kbd> sil • <kbd>F2</kbd> adlandır • <kbd>Shift+Delete</kbd> kalıcı sil<br>Bu kısayollar yalnızca odak sanal penceredeyken çalışır. Win+D ve Alt+F4 tarayıcı/işletim sistemine aittir; burada yakalanmaz.</div></div></div><div id="explorer-context" class="context-menu" role="group" aria-label="Dosya işlemleri" hidden></div>`;
    updateTasks(); selectionUI();
    if (focus) document.getElementById('explorer-window').focus({preventScroll:true});
  }
  // Seçim değiştiğinde dosyaları ve işlem düğmelerini yeniden kurmadan günceller.
  function selectionUI() {
    panel.querySelectorAll('[data-file]').forEach(button => {
      const isSelected = selected.includes(button.dataset.file); button.classList.toggle('selected',isSelected); button.setAttribute('aria-pressed',String(isSelected));
    });
    panel.querySelectorAll('[data-action]').forEach(button => { button.disabled = !enabled(button.dataset.action); });
    document.getElementById('explorer-status').textContent = `${visible().length} öğe • ${selected.length} seçili${clipboard ? ` • Panoda ${clipboard.ids.length} öğe (${clipboard.mode === 'cut' ? 'kesildi' : 'kopyalandı'})` : ''}`;
  }
  // Güncel VFS durumunu görevlerle karşılaştırarak otomatik yeşil işaretleri oluşturur.
  function updateTasks() {
    let done = 0;
    document.getElementById('task-list').innerHTML = tasks.map((task,index) => {
      const completed = !!Bil.tasks.check(vfs,task); if (completed) done++;
      return `<li class="${completed ? 'done' : ''}"><span class="task-state" aria-label="${completed ? 'Tamamlandı' : 'Bekliyor'}">${completed ? '✓' : '□'}</span><span>${index+1}. ${e(task.text)}</span></li>`;
    }).join('');
    document.getElementById('scenario-progress').textContent = `${done} / ${tasks.length} görev tamamlandı${done === tasks.length ? ' — Tebrikler!' : ''}`;
    if (done === tasks.length && !announced) { announced = true; Bil.toast('Tebrikler! Bu senaryonun bütün görevlerini tamamladınız.'); }
    if (done !== tasks.length) announced = false;
  }
  // Tekli, Ctrl ile çoklu veya Shift ile aralıklı öğe seçimini yönetir.
  function select(id,event = {}) {
    if (event.shiftKey && selected.length) {
      const ids = visible().map(node => node.id); const a = ids.indexOf(selected[selected.length-1]); const b = ids.indexOf(id);
      selected = ids.slice(Math.min(a,b),Math.max(a,b)+1);
    } else if (event.ctrlKey || event.metaKey) selected = selected.includes(id) ? selected.filter(key => key !== id) : [...selected,id];
    else selected = [id];
    selectionUI();
  }
  // Klasöre girer; sanal dosyaların gerçek program çalıştırmadığını açıklar.
  function open(id) {
    if (current === 'bin') { properties(id); return; }
    const node = vfs.get(id);
    if (node?.type === 'folder') navigate(id);
    else if (node) Bil.modal(node.name,`<p>Bu, eğitim için oluşturulmuş sanal bir dosyadır. Gerçek içerik veya program çalıştırmaz.</p><p><strong>Tür:</strong> ${e(type(node))}<br><strong>Boyut:</strong> ${Bil.size(node.size)}</p><p class="muted">Kopyalama, taşıma ve adlandırma işlemlerini bu öğeyle deneyebilirsiniz.</p>`);
  }
  // Öğenin türünü, toplam boyutunu ve bulunduğu konumu gösterir.
  function properties(id = selected[0]) {
    const entry = current === 'bin' ? vfs.bin.find(item => item.id === id) : null;
    const node = entry ? entry.nodes.find(item => item.id === id) : vfs.get(id); if (!node) return;
    const bytes = entry ? entry.nodes.reduce((sum,item) => sum+item.size,0) : vfs.bytes(id);
    const path = entry ? 'Geri Dönüşüm Kutusu' : vfs.trail(node.parent).map(item => item.name).join('\\');
    Bil.modal('Özellikler',`<p><strong>Ad:</strong> ${e(node.name)}</p><p><strong>Tür:</strong> ${e(type(node))}</p><p><strong>Boyut:</strong> ${Bil.size(bytes)} (${bytes.toLocaleString('tr-TR')} bayt)</p><p style="overflow-wrap:anywhere"><strong>Konum:</strong> ${e(path)}</p>${node.type === 'folder' ? '<p class="muted">Boyut, alt dosyaların toplamıdır; gerçek disk kullanımı değildir.</p>' : ''}`);
  }
  // Bir işlemden sonra eksik pano kaynaklarını temizleyip ekranı günceller.
  function changed(message) {
    if (clipboard) { clipboard.ids = clipboard.ids.filter(id => vfs.get(id)); if (!clipboard.ids.length) clipboard = null; }
    render(true); if (message) Bil.toast(message);
  }
  // Yapıştırmayı önceden doğrular; çoklu taşıma sırasında kısmi işlem oluşmasını önler.
  function paste() {
    if (!clipboard || current === 'bin') return;
    const ids = clipboard.ids.slice();
    ids.forEach(id => {
      const node = vfs.get(id); if (!node) throw new Error('Panodaki kaynak artık bulunamıyor. Yeniden kopyalayın.');
      if (vfs.descendants(id).includes(current)) throw new Error('Klasörü kendi içine yapıştıramazsınız.');
      if (clipboard.mode === 'cut') vfs.validate(node.name,current,id);
    });
    selected = ids.map(id => clipboard.mode === 'cut' ? vfs.move(id,current) : vfs.copy(id,current));
    if (clipboard.mode === 'cut') clipboard = null;
    changed(`${ids.length} öğe yapıştırıldı.`);
  }
  // Geri alınamaz işlemler için açık onay ister; kutu silmesi de kalıcıdır.
  async function deleteSelected(permanent = false) {
    const ids = selected.slice(); const isPermanent = permanent || current === 'bin';
    if (isPermanent) {
      const yes = await Bil.modal('Kalıcı silme',`<p>${ids.length} seçili öğe ve varsa alt dosyaları kalıcı silinecek. Bu simülasyonda geri yüklenemez. Doğru öğeleri seçtiğinizden emin misiniz?</p>`,{cancel:true,ok:'Kalıcı Sil',danger:true});
      if (!yes) return;
    }
    ids.forEach(id => current === 'bin' ? vfs.purge(id) : vfs.delete(id,isPermanent)); selected = [];
    changed(isPermanent ? 'Öğeler kalıcı silindi.' : 'Öğeler Geri Dönüşüm Kutusu’na gönderildi.');
  }
  // İlgili araç çubuğu, bağlam menüsü veya kısayol işlemini merkezi olarak yürütür.
  async function action(name) {
    if (!enabled(name)) return;
    closeMenu(false);
    try {
      if (name === 'open') { open(selected[0]); }
      else if (name === 'new') {
        const nameValue = await Bil.input('Yeni klasör oluştur'); if (nameValue === null) return;
        selected = [vfs.mkdir(current,nameValue)]; changed('Yeni klasör oluşturuldu.');
      } else if (name === 'rename') {
        const node = vfs.get(selected[0]); const value = await Bil.input('Yeniden adlandır',node.name); if (value === null) return;
        vfs.rename(node.id,value); changed('Öğenin adı değiştirildi.');
      } else if (name === 'copy' || name === 'cut') {
        clipboard = {mode:name,ids:selected.slice()}; changed(`${selected.length} öğe ${name === 'copy' ? 'kopyalandı' : 'kesildi'}. Hedef klasöre gidip Yapıştır’ı seçin.`);
      } else if (name === 'paste') paste();
      else if (name === 'delete' || name === 'permanent') await deleteSelected(name === 'permanent');
      else if (name === 'restore') {
        selected.slice().forEach(id => vfs.restore(id)); selected = []; changed('Öğeler eski konumlarına geri yüklendi.');
      } else if (name === 'empty') {
        const yes = await Bil.modal('Kutu boşaltılsın mı?','<p>Kutudaki tüm öğeler kalıcı silinecek; geri yüklenemeyecek.</p>',{cancel:true,ok:'Kutuyu Boşalt',danger:true});
        if (yes) { vfs.bin.map(entry => entry.id).forEach(id => vfs.purge(id)); selected = []; changed('Geri Dönüşüm Kutusu boşaltıldı.'); }
      } else if (name === 'properties') properties();
    } catch (error) { Bil.toast(error.message); render(true); }
  }
  // Bağlam menüsünü kapatır; klavyeden kapatmada odağı sanal pencereye döndürür.
  function closeMenu(focus = false) {
    const menu = document.getElementById('explorer-context'); if (!menu || menu.hidden) return;
    menu.hidden = true; if (focus) document.getElementById('explorer-window').focus({preventScroll:true});
  }
  // Sağ tık veya klavye ile ekran sınırlarını aşmayan bir işlem menüsü açar.
  function menu(event) {
    event.preventDefault();
    const item = event.target.closest('[data-file]');
    if (item && !selected.includes(item.dataset.file)) select(item.dataset.file);
    if (!item && event.type === 'contextmenu') selected = [];
    selectionUI();
    const box = document.getElementById('explorer-context');
    box.innerHTML = current === 'bin' ? actionButton('restore','Geri Yükle')+actionButton('delete','Kalıcı Sil')+actionButton('properties','Özellikler') : actionButton('new','Yeni Klasör')+actionButton('rename','Yeniden Adlandır — F2')+actionButton('copy','Kopyala — Ctrl+C')+actionButton('cut','Kes — Ctrl+X')+actionButton('paste','Yapıştır — Ctrl+V')+actionButton('delete','Sil — Delete')+actionButton('permanent','Kalıcı Sil — Shift+Delete')+actionButton('properties','Özellikler');
    box.hidden = false;
    const anchor = event.target.getBoundingClientRect(); const x = event.type === 'contextmenu' ? event.clientX : anchor.left; const y = event.type === 'contextmenu' ? event.clientY : anchor.bottom;
    box.style.left = `${Math.max(8,Math.min(x,innerWidth-box.offsetWidth-8))}px`; box.style.top = `${Math.max(8,Math.min(y,innerHeight-box.offsetHeight-8))}px`;
    box.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }
  // Kullanıcının girdiği simülasyon yolunu bulur ve sadece klasörse açar.
  function address(value) {
    const parts = value.trim().split(/[\\/]/).filter(Boolean); if (parts[0] === 'Masaüstü') parts.shift();
    const node = vfs.resolve(parts);
    if (node?.type === 'folder') navigate(node.id);
    else Bil.toast('Bu klasör bulunamadı. Örnek yol: Masaüstü\\Belgeler');
  }
  // Senaryo değişikliğini veya sıfırlamayı veri kaybı uyarısıyla onaylatır.
  async function choose(index,force = false) {
    if (!force && index === scenarioIndex) return;
    if (vfs.events.length) {
      const yes = await Bil.modal('Pratik alanı sıfırlansın mı?','<p>Mevcut sanal dosyalar, pano ve görev ilerlemesi silinip seçilen senaryo başlangıca dönecek.</p>',{cancel:true,ok:'Senaryoyu aç'});
      if (!yes) { document.getElementById('scenario-select').value = scenarioIndex; return; }
    }
    reset(index); document.getElementById('scenario-select').focus({preventScroll:true});
  }
  // Tüm gezgin olaylarını kökten dinler; kısayolları yalnızca pencere odağında yakalar.
  function init() {
    reset(0);
    panel.addEventListener('change',event => { if (event.target.id === 'scenario-select') choose(Number(event.target.value)); });
    panel.addEventListener('click',event => {
      const button = event.target.closest('button');
      if (button?.dataset.action) { action(button.dataset.action); return; }
      if (button?.dataset.folder) { navigate(button.dataset.folder); return; }
      if (button?.dataset.file) { select(button.dataset.file,event); return; }
      if (button?.id === 'explorer-back') back();
      if (button?.id === 'explorer-up') navigate(vfs.get(current).parent);
      if (button?.id === 'scenario-reset') choose(scenarioIndex,true);
      if (event.target.id === 'file-list' || event.target.classList.contains('empty')) { selected = []; selectionUI(); }
    });
    panel.addEventListener('dblclick',event => { const item = event.target.closest('[data-file]'); if (item) open(item.dataset.file); });
    panel.addEventListener('contextmenu',event => { if (event.target.closest('#file-area') && !document.getElementById('app-dialog').open) menu(event); });
    panel.addEventListener('keydown',event => {
      if (event.target.id === 'explorer-address') { if (event.key === 'Enter') { event.preventDefault(); address(event.target.value); } return; }
      if (event.target.closest('input,textarea,select') || document.getElementById('app-dialog').open) return;
      if (event.target.closest('#explorer-context')) {
        const menuBox = document.getElementById('explorer-context');
        if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); const buttons = [...menuBox.querySelectorAll('button:not(:disabled)')]; const index = buttons.indexOf(document.activeElement);
          buttons[(index + (event.key === 'ArrowDown' ? 1 : buttons.length-1)) % buttons.length]?.focus();
        }
        return;
      }
      if (!event.target.closest('#explorer-window')) return;
      const ctrl = event.ctrlKey || event.metaKey; const key = event.key.toLowerCase();
      const commands = {c:'copy',x:'cut',v:'paste'};
      if (ctrl && commands[key]) { event.preventDefault(); action(commands[key]); }
      else if (ctrl && key === 'a') { event.preventDefault(); selected = visible().map(node => node.id); selectionUI(); }
      else if (key === 'delete') { event.preventDefault(); action(event.shiftKey ? 'permanent' : 'delete'); }
      else if (key === 'f2') { event.preventDefault(); action('rename'); }
      else if (event.shiftKey && key === 'f10') menu(event);
      else if (key === 'escape') { selected = []; selectionUI(); }
      else if (key === 'enter' && event.target.closest('[data-file]')) { event.preventDefault(); open(event.target.closest('[data-file]').dataset.file); }
    });
    document.addEventListener('pointerdown',event => { if (!event.target.closest('#explorer-context')) closeMenu(false); });
    window.addEventListener('resize',() => closeMenu(false));
  }
  return {init};
})();
