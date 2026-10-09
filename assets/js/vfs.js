/* Düz düğüm tablosu kullanan bağımsız sanal dosya sistemi. Gerçek diske erişmez. */
Bil.VFS = class {
  // Senaryonun ağacını düz düğüm listesine dönüştürerek temiz durumu kurar.
  constructor(tree) {
    this.nodes = [{id:'root',parent:null,name:'Masaüstü',type:'folder',size:0,origin:'root'}];
    this.bin = []; this.events = []; this.sequence = 0;
    this.build(tree,'root');
  }
  // İç içe senaryo tanımından dosya ve klasör düğümleri üretir.
  build(tree,parent) {
    Object.entries(tree).forEach(([name,value]) => {
      const id = this.id(); const folder = typeof value === 'object';
      this.nodes.push({id,parent,name,type:folder ? 'folder' : 'file',size:folder ? 0 : value,origin:id});
      if (folder) this.build(value,id);
    });
  }
  // Bu oturumda çakışmayan, kararlı bir öğe kimliği üretir.
  id() { return `node-${++this.sequence}`; }
  // Kimliğe karşılık gelen etkin düğümü bulur.
  get(id) { return this.nodes.find(node => node.id === id); }
  // Bir klasörün doğrudan çocuklarını klasörler önce olacak şekilde sıralar.
  children(parent) { return this.nodes.filter(node => node.parent === parent).sort((a,b) => (a.type !== b.type ? (a.type === 'folder' ? -1 : 1) : a.name.localeCompare(b.name,'tr'))); }
  // Senaryo yolunu kökten takip eder; bulunmayan yolda null döndürür.
  resolve(path) {
    let node = this.get('root');
    for (const name of path) { node = this.nodes.find(item => item.parent === node?.id && item.name === name); if (!node) return null; }
    return node;
  }
  // Bir düğümün kendisi ve tüm alt öğelerinin kimliklerini toplar.
  descendants(id) {
    const ids = [id]; for (const node of this.nodes.filter(item => item.parent === id)) ids.push(...this.descendants(node.id)); return ids;
  }
  // Klasör yolunu kökten itibaren düğüm dizisi olarak döndürür.
  trail(id) { const node = this.get(id); return !node ? [] : node.parent ? [...this.trail(node.parent),node] : [node]; }
  // Dosya boyutunu veya klasörün toplam alt dosya boyutunu hesaplar.
  bytes(id) { return this.descendants(id).reduce((sum,key) => sum + (this.get(key)?.size || 0),0); }
  // Windows benzeri ad kurallarını ve aynı klasördeki ad çakışmasını doğrular.
  validate(name,parent,except = null) {
    if (!name || name.length > 80 || /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) || /^\s/.test(name) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)) throw new Error('Geçerli bir ad yazın. Başta boşluk, sonda nokta/boşluk ve özel karakter kullanmayın. CON gibi ayrılmış adlar kullanılamaz.');
    if (this.nodes.some(node => node.parent === parent && node.id !== except && node.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'))) throw new Error('Bu klasörde aynı adlı bir öğe var. Farklı bir ad seçin.');
    return name;
  }
  // Var olan adı ezmeden bir kopya adı türetir; dosyanın uzantısını korur.
  unique(name,parent) {
    const dot = name.lastIndexOf('.'); const base = dot > 0 ? name.slice(0,dot) : name; const ext = dot > 0 ? name.slice(dot) : '';
    let candidate = name; let n = 1;
    while (this.nodes.some(node => node.parent === parent && node.name.toLocaleLowerCase('tr') === candidate.toLocaleLowerCase('tr'))) candidate = `${base.slice(0,55)} - Kopya${n === 1 ? '' : ` (${n})`}${ext}`.slice(0,80), n++;
    return candidate;
  }
  // Yeni klasör oluşturur ve işlem kaydını ekler.
  mkdir(parent,name) {
    if (this.get(parent)?.type !== 'folder') throw new Error('Hedef klasör bulunamadı.');
    const node = {id:this.id(),parent,name:this.validate(name,parent),type:'folder',size:0}; node.origin = node.id;
    this.nodes.push(node); this.events.push({action:'create',id:node.id}); return node.id;
  }
  // Öğenin kimliğini değiştirmeden yalnızca adını değiştirir.
  rename(id,name) {
    const node = this.get(id); if (!node || id === 'root') throw new Error('Önce bir dosya veya klasör seçin.');
    node.name = this.validate(name,node.parent,id); this.events.push({action:'rename',id});
  }
  // Düğümü ve alt ağacı yeni kimliklerle kopyalar, asıl öğeyi korur.
  copy(id,parent) {
    const source = this.get(id); const target = this.get(parent);
    if (!source || id === 'root' || target?.type !== 'folder') throw new Error('Kaynak veya hedef bulunamadı.');
    if (this.descendants(id).includes(parent)) throw new Error('Klasörü kendi içine kopyalayamazsınız.');
    const snapshot = this.descendants(id).map(key => ({...this.get(key)})); const mapping = new Map(snapshot.map(node => [node.id,this.id()]));
    const name = this.unique(source.name,parent);
    snapshot.forEach(node => this.nodes.push({...node,id:mapping.get(node.id),parent:node.id === id ? parent : mapping.get(node.parent),name:node.id === id ? name : node.name}));
    this.events.push({action:'copy',id,copyId:mapping.get(id)}); return mapping.get(id);
  }
  // Düğümü kimliğini koruyarak başka klasöre taşır; döngüleri önler.
  move(id,parent) {
    const node = this.get(id);
    if (!node || id === 'root' || this.get(parent)?.type !== 'folder') throw new Error('Kaynak veya hedef bulunamadı.');
    if (this.descendants(id).includes(parent)) throw new Error('Klasörü kendi içine taşıyamazsınız.');
    if (node.parent === parent) return id;
    this.validate(node.name,parent,id); node.parent = parent; this.events.push({action:'move',id}); return id;
  }
  // Bir öğeyi ve alt ağacını kutuya gönderir veya kalıcı olarak kaldırır.
  delete(id,permanent = false) {
    const node = this.get(id); if (!node || id === 'root') throw new Error('Silinecek öğeyi seçin.');
    const ids = this.descendants(id); const snapshot = ids.map(key => ({...this.get(key)}));
    if (!permanent) this.bin.push({id,parent:node.parent,nodes:snapshot});
    this.nodes = this.nodes.filter(item => !ids.includes(item.id));
    this.events.push({action:permanent ? 'permanent' : 'delete',id,ids});
  }
  // Kutudaki öğeyi eski yerine getirir; üst klasör yoksa kullanıcıya açıklayıcı hata verir.
  restore(id) {
    const entry = this.bin.find(item => item.id === id); if (!entry) throw new Error('Kutuda bu öğe bulunamadı.');
    if (!this.get(entry.parent)) throw new Error('Önce bu öğenin eski üst klasörünü geri yükleyin.');
    const root = entry.nodes.find(item => item.id === id); this.validate(root.name,entry.parent);
    this.nodes.push(...entry.nodes.map(node => ({...node}))); this.bin = this.bin.filter(item => item.id !== id);
    this.events.push({action:'restore',id});
  }
  // Geri Dönüşüm Kutusu’ndaki bir öğeyi geri alınamayacak şekilde kaldırır.
  purge(id) {
    const entry = this.bin.find(item => item.id === id); if (!entry) throw new Error('Öğe bulunamadı.');
    this.bin = this.bin.filter(item => item.id !== id); this.events.push({action:'permanent',id,ids:entry.nodes.map(node => node.id)});
  }
};
