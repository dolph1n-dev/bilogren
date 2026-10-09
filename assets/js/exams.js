/* Sınav oturumları modül içinde tutulur; kullanıcı izin verirse yerel kayıt yapılır. */
Bil.exams = (() => {
  const e = Bil.escape;
  const panel = document.getElementById('sinavlar');
  const sessions = {};
  let active = null;
  let remember = Bil.read('remember',false) === true;
  let storageWarning = false;
  // Boş, bağımsız bir sınav oturumu üretir.
  function empty() { return {version:1,answers:Array(40).fill(null),index:0,view:'single',finished:false}; }
  // Eski veya bozulmuş yerel kayıtları doğrulayarak güvenli bir oturum yükler.
  function load(id) {
    const saved = remember ? Bil.read(`exam.${id}`,null) : null;
    if (!saved || saved.version !== 1 || !Array.isArray(saved.answers) || saved.answers.length !== 40) return empty();
    return {version:1, answers:saved.answers.map(value => Number.isInteger(value) && value >= 0 && value < 4 ? value : null), index:Number.isInteger(saved.index) && saved.index >= 0 && saved.index < 40 ? saved.index : 0, view:saved.view === 'list' ? 'list' : 'single', finished:saved.finished === true};
  }
  // İzin varsa oturumu hemen kaydeder; yazma hatasını bir kez görünür kılar.
  function save() {
    if (!remember || !active) return;
    if (!Bil.write(`exam.${active}`,sessions[active]) && !storageWarning) {
      storageWarning = true; Bil.toast('Tarayıcı kayıt yapamıyor. Cevaplar bu sayfa açıkken korunur, yenilemede kaybolabilir.');
    }
  }
  // Etkin sınav tanımını veri bankasından bulur.
  function exam() { return Bil.data.exams.find(item => item.id === active); }
  // Cevapları doğru, yanlış ve boş olarak sayar; 100 üzerinden puan hesaplar.
  function stats(id = active) {
    const definition = Bil.data.exams.find(item => item.id === id); const answers = sessions[id].answers;
    const correct = answers.reduce((total,value,index) => total + (value === definition.questions[index][2] ? 1 : 0),0);
    const blank = answers.filter(value => value === null).length;
    return {correct,blank,wrong:40-correct-blank,score:correct*2.5,answered:40-blank};
  }
  // İki sınavın seçilebildiği giriş ekranını ve kayıt tercihini gösterir.
  function home() {
    active = null;
    panel.innerHTML = `<div class="module-intro"><p class="eyebrow">02 / Sınav merkezi</p><h1>Bildiklerinizi keşfedin.</h1><p class="muted">Her sınavda 40 soru var. Süre sınırı yok; düşünerek ilerleyin. Bitirdiğinizde her sorunun açıklamasını inceleyebilirsiniz.</p></div><div class="grid-2">${Bil.data.exams.map((item,index) => {
      const session = sessions[item.id]; const answered = session.answers.filter(value => value !== null).length;
      return `<article class="card exam-card"><span class="badge">Sınav ${index+1} • 40 soru</span><h2>${e(item.title)}</h2><p>${e(item.subtitle)}</p><p class="small">${index === 0 ? 'Kısayollar • Uzantılar • Donanım • Klasörler' : 'Gerçek yaşam durumları • Uygulama • Güvenli işlemler'}</p><div class="actions"><button class="primary" data-start="${item.id}">${session.finished ? 'Sonuçları gör' : answered ? 'Kaldığım yerden devam et' : 'Sınava başla'} →</button>${answered || session.finished ? `<button data-reset="${item.id}">Yeni deneme</button>` : ''}</div><p class="muted small" style="margin-top:16px">${session.finished ? 'Tamamlandı' : `${answered} / 40 soru cevaplandı`}</p></article>`;
    }).join('')}</div><div class="exam-settings"><label class="check-label"><input id="remember-exam" type="checkbox" ${remember ? 'checked' : ''}> Cevaplarımı bu tarayıcıda sakla</label></div><p class="muted small">${remember ? 'Kayıt açık: aynı tarayıcıda sayfayı yenileseniz de devam edebilirsiniz.' : 'Kayıt kapalı: sayfayı yenilerseniz cevaplar sıfırlanır.'} Ortak bilgisayarda kayıt seçeneğini kapatın. Kapatmak önceki sınav kayıtlarını da siler.</p>`;
  }
  // Tek sorunun seçeneklerini gerçek radio alanlarıyla oluşturur.
  function questionHTML(index) {
    const [text,options,,,topic] = exam().questions[index]; const session = sessions[active];
    return `<article class="card question" id="question-${index}"><p class="question-number">Soru ${index+1} / 40 • ${e(topic)}</p><h2 id="q-title-${index}" tabindex="-1">${e(text)}</h2><div role="radiogroup" aria-labelledby="q-title-${index}" class="answers">${options.map((option,choice) => `<label class="answer"><input type="radio" name="q-${index}" value="${choice}" data-question="${index}" ${session.answers[index] === choice ? 'checked' : ''}><span>${String.fromCharCode(65+choice)}. ${e(option)}</span></label>`).join('')}</div><button class="quiet" data-clear="${index}" style="margin-top:12px">Seçimi kaldır</button></article>`;
  }
  // Cevap sayısını, ilerleme çubuğunu ve soru haritasını günceller.
  function summary() {
    const result = stats(); const session = sessions[active];
    document.getElementById('exam-progress').innerHTML = `<strong>${result.answered} / 40 cevaplandı</strong><div class="progress" role="progressbar" aria-label="Cevaplanan sorular" aria-valuemin="0" aria-valuemax="40" aria-valuenow="${result.answered}"><span style="width:${result.answered/40*100}%"></span></div>`;
    document.getElementById('question-map').innerHTML = session.answers.map((value,index) => `<button class="${value !== null ? 'answered' : ''} ${index === session.index ? 'current' : ''}" data-jump="${index}" aria-label="Soru ${index+1}, ${value === null ? 'boş' : 'cevaplandı'}" ${index === session.index ? 'aria-current="true"' : ''}>${index+1}</button>`).join('');
  }
  // Seçilen tek-soru veya liste görünümünü çizer.
  function render(focus = false) {
    const definition = exam(); const session = sessions[active];
    if (session.finished) { results(); return; }
    panel.innerHTML = `<div class="module-intro"><p class="eyebrow">Sınav merkezi</p><h1>${e(definition.title)}</h1><p class="muted">Bir seçeneğe tıkladığınızda cevabınız hemen işlenir. İstediğiniz zaman değiştirebilirsiniz.</p></div><div class="exam-toolbar"><button data-exam-home>← Sınav seçimine dön</button><label>Görünüm <select id="exam-view"><option value="single" ${session.view === 'single' ? 'selected' : ''}>Soruları tek tek göster</option><option value="list" ${session.view === 'list' ? 'selected' : ''}>Tüm soruları listele</option></select></label></div><div class="exam-layout"><div>${session.view === 'single' ? questionHTML(session.index) : definition.questions.map((_,index) => questionHTML(index)).join('')}${session.view === 'single' ? `<div class="question-nav"><button data-nav="-1" ${session.index === 0 ? 'disabled' : ''}>← Önceki soru</button><button data-nav="1" ${session.index === 39 ? 'disabled' : ''}>Sonraki soru →</button></div>` : ''}<button class="primary" data-finish style="margin-top:24px">Sınavı Bitir</button></div><aside class="card exam-summary"><div id="exam-progress" role="status"></div><details ${innerWidth > 760 ? 'open' : ''}><summary>Sorulara git</summary><div class="question-map" id="question-map"></div><p class="legend">Mavi kutular cevaplandı.<br>Dilediğiniz soruya dönebilirsiniz.</p></details><p class="legend">${remember ? 'Yerel kayıt açık.' : 'Yerel kayıt kapalı.'}</p></aside></div>`;
    summary(); if (focus) document.getElementById(`q-title-${session.index}`)?.focus({preventScroll:true});
  }
  // Sonuç ekranını hesaplar; açıklamalı inceleme satırlarını hazırlar.
  function results(filter = 'all') {
    const definition = exam(); const result = stats();
    panel.innerHTML = `<div class="module-intro"><p class="eyebrow">Sınav tamamlandı</p><h1>Bir adım daha ilerlediniz.</h1><p class="muted">${e(definition.title)} — Yanlış cevaplar puanı azaltmaz. Her doğru cevap 2,5 puandır.</p></div><div class="score-grid"><div class="metric"><strong>${result.score.toLocaleString('tr-TR')} / 100</strong><span>Toplam puan</span></div><div class="metric"><strong class="good-text">${result.correct}</strong><span>Doğru</span></div><div class="metric"><strong class="bad-text">${result.wrong}</strong><span>Yanlış</span></div><div class="metric"><strong>${result.blank}</strong><span>Boş</span></div></div><div class="actions"><button data-exam-home>← Sınav seçimi</button><button class="primary" data-reset="${active}">Yeni deneme başlat</button></div><div class="section-heading"><h2>Çözümleri birlikte inceleyelim</h2><label>Göster <select id="review-filter"><option value="all">Tüm sorular</option><option value="wrong">Yanlış cevaplar</option><option value="blank">Boş sorular</option><option value="correct">Doğru cevaplar</option></select></label></div><div class="card" id="review-list"></div>`;
    document.getElementById('review-filter').value = filter; reviewList(filter);
  }
  // İnceleme listesini sonuç türüne göre filtreler.
  function reviewList(filter) {
    const rows = exam().questions.map((question,index) => {
      const value = sessions[active].answers[index]; const kind = value === null ? 'blank' : value === question[2] ? 'correct' : 'wrong';
      if (filter !== 'all' && filter !== kind) return '';
      const label = {blank:'Boş',correct:'Doğru',wrong:'Yanlış'}[kind];
      return `<div class="review-row"><span class="badge ${kind === 'correct' ? 'status-good' : kind === 'wrong' ? 'status-bad' : ''}">${index+1}. ${label}</span><span>${e(question[0])}</span><button data-review="${index}">Çözümü incele</button></div>`;
    }).join('');
    document.getElementById('review-list').innerHTML = rows || '<p class="muted">Bu grupta soru yok.</p>';
  }
  // Kullanıcının seçimini, doğru cevabı ve eğitsel gerekçeyi pencerede gösterir.
  function review(index) {
    const [text,options,correct,explanation] = exam().questions[index]; const value = sessions[active].answers[index];
    const right = value === correct;
    Bil.modal(`Soru ${index+1} — ${value === null ? 'Boş bırakıldı' : right ? 'Doğru cevap' : 'Birlikte düzeltelim'}`, `<p><strong>${e(text)}</strong></p><p>Sizin cevabınız: <strong class="${right ? 'good-text' : 'bad-text'}">${value === null ? 'Cevap verilmedi' : e(options[value])}</strong></p><p>Doğru cevap: <strong class="good-text">${e(options[correct])}</strong></p><div class="feedback"><strong>Neden?</strong><p style="margin-top:8px">${e(explanation)}</p></div>${!right ? '<p class="muted">Bu açıklamayı konu kartlarıyla tekrar edin, ardından yeni bir denemede kendinizi sınayın.</p>' : ''}`);
  }
  // Yeni denemeden önce mevcut oturumun sıfırlanmasını onaylatır.
  async function reset(id) {
    const yes = await Bil.modal('Yeni deneme başlatılsın mı?','<p>Bu sınavın mevcut cevapları ve sonucu sıfırlanacak. Diğer sınav etkilenmez.</p>',{cancel:true,ok:'Yeni deneme'});
    if (!yes) return; sessions[id] = empty(); active = id; save(); render(true);
  }
  // Sınavı kilitler ve tek bir sonuç ekranında doğru/yanlış/boş sayısını gösterir.
  async function finish() {
    const result = stats(); const yes = await Bil.modal('Sınavı bitiriyor musunuz?',`<p>${result.answered} soruyu cevapladınız, ${result.blank} soru boş. Bitirdikten sonra bu denemenin cevapları değiştirilemez; çözümleri inceleyebilirsiniz.</p>`,{cancel:true,ok:'Sınavı Bitir'});
    if (!yes) return; sessions[active].finished = true; save(); results(); panel.querySelector('h1').tabIndex = -1; panel.querySelector('h1').focus();
  }
  // Tüm sınav olaylarını tek kökten dinleyerek yeniden çizim sonrası da işler.
  function init() {
    Bil.data.exams.forEach(item => { sessions[item.id] = load(item.id); }); home();
    panel.addEventListener('change', event => {
      const target = event.target;
      if (target.id === 'remember-exam') {
        remember = target.checked; Bil.write('remember',remember);
        if (!remember) Bil.data.exams.forEach(item => Bil.remove(`exam.${item.id}`));
        else Bil.data.exams.forEach(item => { active = item.id; save(); });
        home(); document.getElementById('remember-exam').focus(); return;
      }
      if (target.id === 'review-filter') { reviewList(target.value); return; }
      if (!active || sessions[active].finished) return;
      if (target.id === 'exam-view') { sessions[active].view = target.value; save(); render(); document.getElementById('exam-view').focus(); }
      if (target.dataset.question !== undefined) { sessions[active].answers[Number(target.dataset.question)] = Number(target.value); save(); summary(); }
    });
    panel.addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      if (button.dataset.start) { active = button.dataset.start; render(true); }
      else if (button.dataset.reset) reset(button.dataset.reset);
      else if (button.hasAttribute('data-exam-home')) home();
      else if (button.dataset.review !== undefined) review(Number(button.dataset.review));
      else if (active && !sessions[active].finished) {
        const session = sessions[active];
        if (button.hasAttribute('data-finish')) finish();
        if (button.dataset.nav) { session.index = Math.max(0,Math.min(39,session.index+Number(button.dataset.nav))); save(); render(true); }
        if (button.dataset.jump !== undefined) {
          session.index = Number(button.dataset.jump); save();
          if (session.view === 'single') render(true);
          else { summary(); document.getElementById(`question-${session.index}`).scrollIntoView({block:'start'}); document.getElementById(`q-title-${session.index}`).focus({preventScroll:true}); }
        }
        if (button.dataset.clear !== undefined) { session.answers[Number(button.dataset.clear)] = null; save(); render(); }
      }
    });
  }
  return {init,stats};
})();
