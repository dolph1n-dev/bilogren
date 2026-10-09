/* Bu testler paket kurulmadan tarayıcıda çalışır; yalnızca örnek veri kullanır. */
(() => {
  const lines = []; let passed = 0; let failed = 0;
  // Doğru olmayan beklentiyi açıklayıcı hataya dönüştürür.
  function assert(value,message) { if (!value) throw new Error(message); }
  // Bir kontrolü bağımsız çalıştırıp ekrandaki sonuç listesine ekler.
  function test(name,fn) { try { fn(); passed++; lines.push(`✓ ${name}`); } catch (error) { failed++; lines.push(`✕ ${name}: ${error.message}`); } }
  // Beklenen korumanın bir hata ürettiğini doğrular.
  function throws(fn) { let raised = false; try { fn(); } catch { raised = true; } assert(raised,'İşlem reddedilmeliydi'); }
  // Görevi gerçek VFS komutuyla tamamlar; denetçiye doğrudan durum yazmaz.
  function solve(fs,task) {
    const parent = task.to ? fs.resolve(task.to.slice(0,-1)) : null;
    if (task.kind === 'folder') fs.mkdir(parent.id,task.to.at(-1));
    if (task.kind === 'rename') fs.rename(task.sourceId,task.to.at(-1));
    if (task.kind === 'move') fs.move(task.sourceId,parent.id);
    if (task.kind === 'copy') fs.copy(task.sourceId,parent.id);
    if (task.kind === 'recycle' || task.kind === 'deletedOnce') fs.delete(task.sourceId);
    if (task.kind === 'restore') fs.restore(task.sourceId);
    if (task.kind === 'permanent') fs.delete(task.sourceId,true);
  }
  Bil.data.exams.forEach(exam => test(`${exam.title}: 40 geçerli soru`,() => {
    assert(exam.questions.length === 40,'Soru sayısı 40 değil');
    exam.questions.forEach(q => { assert(q[1].length === 4,'Dört seçenek gerekli'); assert(new Set(q[1]).size === 4,'Tekrarlı seçenek'); assert(Number.isInteger(q[2]) && q[2]>=0 && q[2]<4,'Yanlış cevap anahtarı'); assert(q[3].length>25,'Açıklama eksik'); });
  }));
  test('80 sorunun metinleri birbirinden farklı',() => assert(new Set(Bil.data.exams.flatMap(exam => exam.questions.map(q => q[0]))).size === 80,'Tekrarlı soru'));
  test('11 kısayol ve 10 uzantı kartı',() => { assert(Bil.data.shortcuts.length === 11,'Kısayol eksik'); assert(Bil.data.extensions.length === 10,'Uzantı eksik'); });
  Bil.scenarios.forEach((scenario,index) => test(`Senaryo ${index+1}: ${scenario.title} — dört görev`,() => {
    const fs = new Bil.VFS(scenario.tree); const tasks = Bil.tasks.prepare(fs,scenario);
    assert(tasks.length === 4,'Dört görev gerekli'); tasks.forEach(task => { assert(!Bil.tasks.check(fs,task),'Görev başlangıçta tamamlanmış'); if (task.from) assert(task.sourceId,'Kaynak eksik'); });
    tasks.forEach(task => { solve(fs,task); assert(Bil.tasks.check(fs,task),`Görev işaretlenmedi: ${task.text}`); });
    assert(tasks.every(task => Bil.tasks.check(fs,task)),'Son durumda bütün görevler geçmeli');
  }));
  test('Kopyalama, taşıma, geri yükleme ve klasör boyutu',() => {
    const fs = new Bil.VFS({A:{'a.txt':2048,B:{'b.docx':4096}},Hedef:{}}); const a = fs.resolve(['A']); const target = fs.resolve(['Hedef']);
    assert(fs.bytes(a.id) === 6144,'Alt klasör boyutu yanlış'); const copyId = fs.copy(a.id,target.id);
    assert(fs.resolve(['A','B','b.docx']),'Asıl öğe kayboldu'); assert(fs.bytes(copyId) === 6144,'Kopya boyutu yanlış');
    const newCopy = fs.copy(a.id,target.id); assert(fs.get(newCopy).name === 'A - Kopya','Çakışma adı yanlış');
    throws(() => fs.move(a.id,fs.resolve(['A','B']).id)); throws(() => fs.copy(a.id,a.id));
    fs.delete(a.id); assert(!fs.get(a.id),'Silinmedi'); fs.restore(a.id); assert(fs.bytes(a.id) === 6144,'Alt ağaç geri yüklenmedi');
    fs.delete(a.id); fs.purge(a.id); assert(!fs.bin.length && !fs.get(a.id),'Kalıcı silme eksik');
  });
  test('Geçersiz ve çakışan adlar engelleniyor',() => {
    const fs = new Bil.VFS({'a.txt':10,Klasor:{}}); const id = fs.resolve(['a.txt']).id;
    ['', 'CON','aux.txt','son.','son ','a/b','a\\b','x:y','x*','x?','x<','x|'].forEach(name => throws(() => fs.mkdir('root',name)));
    throws(() => fs.mkdir('root','A.txt')); throws(() => fs.rename(id,'Klasor')); assert(fs.get(id).name === 'a.txt','Hatalı ad asıl öğeyi değiştirdi');
  });
  test('Üst klasör ve ad çakışması: geri yükleme güvenli',() => {
    const fs = new Bil.VFS({A:{'a.txt':10}}); const a = fs.resolve(['A']).id; const file = fs.resolve(['A','a.txt']).id;
    fs.delete(file); fs.delete(a); throws(() => fs.restore(file)); fs.restore(a); fs.restore(file); assert(fs.get(file),'Geri yükleme eksik');
    fs.delete(a); fs.mkdir('root','A'); throws(() => fs.restore(a)); assert(fs.bin.length === 1,'Hata kutu kaydını sildi');
  });
  test('Görevler yanlış yerdeki öğe ve sıradan silmeyle tamamlanmıyor',() => {
    const scenario = Bil.scenarios[1]; const fs = new Bil.VFS(scenario.tree); const tasks = Bil.tasks.prepare(fs,scenario);
    fs.copy(tasks[0].sourceId,'root'); assert(!Bil.tasks.check(fs,tasks[0]),'Yanlış hedef kabul edildi');
    fs.delete(tasks[2].sourceId); assert(!Bil.tasks.check(fs,tasks[2]),'Kutu silme kalıcı sayıldı');
    fs.purge(tasks[2].sourceId); assert(Bil.tasks.check(fs,tasks[2]),'Kutudan kalıcı silme sayılmadı');
  });
  test('Yazma ölçümleri Unicode ve satır sonlarını sayıyor',() => {
    const measure = Bil.typing.measure('İşlemci RAM','İşlemci RAM'); assert(measure.words === 2 && measure.characters === 11 && measure.accuracy === 100,'Sayaç yanlış');
    assert(Bil.typing.measure('abx','abc').accuracy > 66 && Bil.typing.measure('abx','abc').accuracy < 67,'Doğruluk yanlış');
    assert(Bil.typing.measure('😀','😀').characters === 1,'Unicode karakter bölündü'); assert(Bil.typing.measure('a\r\nb','a\nb').complete === false,'Tamamlanma özgün metni karşılaştırmalı');
  });
  test('RTF Türkçe, özel karakter ve satır sonlarını kaçırıyor',() => {
    const rtf = Bil.typing.rtf('Türkçe: İı Şş Ğğ {a} \\ 😀\nYeni satır');
    assert(rtf.startsWith('{\\rtf1'),'RTF başlığı yok'); assert(rtf.includes('\\u304?') && rtf.includes('\\u305?'),'Türkçe kaçışlar eksik');
    assert(rtf.includes('\\{a\\}') && rtf.includes('\\\\') && rtf.includes('\\par'),'RTF sözdizimi kaçışları eksik');
    assert(rtf.includes('\\u-10179?'),'UTF-16 surrogate yanlış'); assert(/^[\x00-\x7f]*$/.test(rtf),'RTF ASCII uyumlu olmalı');
  });
  document.getElementById('results').textContent = `${lines.join('\n')}\n\n${passed} geçti, ${failed} başarısız.`;
  window.testResults = {passed,failed,lines};
})();
