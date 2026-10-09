/* Sekmeli tek sayfa uygulamasını başlatır; URL parçaları Pages alt dizininde de çalışır. */
(() => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  // Panel görünürlüğünü, sekme odağını ve adres parçacığını uyumlu tutar.
  function activate(id,focus = false) {
    const valid = tabs.some(tab => tab.dataset.tab === id); if (!valid) id = 'konular';
    tabs.forEach(tab => {
      const active = tab.dataset.tab === id;
      tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.dataset.tab).hidden = !active;
      if (active && focus) tab.focus();
    });
    if (location.hash !== `#${id}`) history.replaceState(null,'',`#${id}`);
    document.title = `BilÖğren — ${tabs.find(tab => tab.dataset.tab === id).textContent.replace(/\d+/,'').trim()}`;
  }
  // Ok tuşları ve Home/End ile erişilebilir sekme gezintisini sağlar.
  function tabKeys(event) {
    const index = tabs.indexOf(document.activeElement); if (index < 0) return;
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    let next = offset ? (index+offset+tabs.length)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : null;
    if (next === null) return; event.preventDefault(); activate(tabs[next].dataset.tab,true);
  }
  // Kullanıcı tercihine göre büyük yazı stilini ve düğme etiketini değiştirir.
  function setFont(large) {
    document.documentElement.classList.toggle('font-large',large);
    const button = document.getElementById('font-size'); button.setAttribute('aria-pressed',String(large));
    button.innerHTML = large ? 'A− <span>Normal yazı</span>' : 'A+ <span>Yazıyı büyüt</span>';
    button.title = large ? 'Normal yazı boyutuna dön' : 'Yazıları büyüt';
  }
  Bil.lessons.init(); Bil.exams.init(); Bil.explorer.init(); Bil.typing.init();
  tabs.forEach(tab => tab.addEventListener('click',() => activate(tab.dataset.tab)));
  document.querySelector('.tabs').addEventListener('keydown',tabKeys);
  document.addEventListener('click',event => { const button = event.target.closest('[data-go]'); if (button) { activate(button.dataset.go,true); document.getElementById('main').scrollIntoView({block:'start'}); } });
  window.addEventListener('hashchange',() => activate(location.hash.slice(1)));
  setFont(Bil.read('large-font',false) === true);
  document.getElementById('font-size').onclick = () => { const large = !document.documentElement.classList.contains('font-large'); setFont(large); Bil.write('large-font',large); };
  activate(location.hash.slice(1));
})();
