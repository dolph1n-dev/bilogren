/* Görevler hem güncel dosya durumunu hem de gerekli işlem kimliğini denetler. */
Bil.scenarios = [
  {title:'Okul idaresi',description:'Öğrenci kayıtlarını doğru sınıfa taşıyın ve sınav arşivini düzenleyin.',tree:{'1A_Sinifi':{'Ali_Ozturk.docx':12288,'Veli_Listesi.docx':8192},'1B_Sinifi':{},'Sinavlar':{'Deneme1.xlsx':24576}},tasks:[
    {kind:'move',from:['1A_Sinifi','Ali_Ozturk.docx'],to:['1B_Sinifi','Ali_Ozturk.docx'],text:'Ali_Ozturk.docx dosyasını 1A_Sinifi’ndan kesip 1B_Sinifi’na yapıştırın.'},
    {kind:'rename',from:['Sinavlar','Deneme1.xlsx'],to:['Sinavlar','Seviye_Belirleme.xlsx'],text:'Sinavlar içindeki Deneme1.xlsx adını Seviye_Belirleme.xlsx yapın.'},
    {kind:'folder',to:['Arsiv'],text:'Masaüstünde Arsiv adlı yeni klasör oluşturun.'},
    {kind:'copy',from:['1A_Sinifi','Veli_Listesi.docx'],to:['Arsiv','Veli_Listesi.docx'],text:'Veli_Listesi.docx dosyasını Arsiv’e kopyalayın; aslı yerinde kalsın.'}
  ]},
  {title:'Fotoğraf arşivi düzenleme',description:'Fotoğrafları arşivleyin, hatalı kopyayı kalıcı olarak kaldırın.',tree:{'Ankara.jpg':2097152,'Aile.png':3145728,'Bozuk_Kopya.png':1024,'Resimlerim':{}},tasks:[
    {kind:'copy',from:['Ankara.jpg'],to:['Resimlerim','Ankara.jpg'],text:'Masaüstündeki Ankara.jpg dosyasını Resimlerim’e kopyalayın.'},
    {kind:'copy',from:['Aile.png'],to:['Resimlerim','Aile.png'],text:'Masaüstündeki Aile.png dosyasını Resimlerim’e kopyalayın.'},
    {kind:'permanent',from:['Bozuk_Kopya.png'],text:'Bozuk_Kopya.png dosyasını Shift+Delete ile kalıcı silin.'},
    {kind:'folder',to:['Resimlerim','Geziler'],text:'Resimlerim içinde Geziler adlı klasör oluşturun.'}
  ]},
  {title:'Hastane arşivi',description:'Kurgusal hasta kayıtlarıyla yıl klasörleri ve belge adları üzerinde çalışın.',tree:{'Kayitlar':{'Hasta_001.docx':14336,'Sonuc.txt':2048,'Bilgilendirme.rtf':6144},'2026':{},'Arsiv':{}},tasks:[
    {kind:'move',from:['Kayitlar','Hasta_001.docx'],to:['2026','Hasta_001.docx'],text:'Kayitlar içindeki Hasta_001.docx dosyasını 2026 klasörüne taşıyın.'},
    {kind:'rename',from:['Kayitlar','Sonuc.txt'],to:['Kayitlar','Laboratuvar_Sonucu.txt'],text:'Sonuc.txt adını Laboratuvar_Sonucu.txt yapın.'},
    {kind:'copy',from:['Kayitlar','Bilgilendirme.rtf'],to:['Arsiv','Bilgilendirme.rtf'],text:'Bilgilendirme.rtf dosyasını Arsiv’e kopyalayın.'},
    {kind:'folder',to:['2026','Randevular'],text:'2026 içinde Randevular adlı klasör oluşturun.'}
  ]},
  {title:'Muhasebe evrakları',description:'Makbuz ve faturaları düzenli bir ofis arşivine dönüştürün.',tree:{'Gelen_Evrak':{'Fatura1.xlsx':32768,'Makbuz.docx':9216},'Muhasebe':{'Gelir_Gider.xlsx':40960},'Yedek':{}},tasks:[
    {kind:'rename',from:['Gelen_Evrak','Fatura1.xlsx'],to:['Gelen_Evrak','Ekim_Faturasi.xlsx'],text:'Gelen_Evrak içindeki Fatura1.xlsx adını Ekim_Faturasi.xlsx yapın.'},
    {kind:'move',from:['Gelen_Evrak','Makbuz.docx'],to:['Muhasebe','Makbuz.docx'],text:'Makbuz.docx dosyasını Muhasebe’ye taşıyın.'},
    {kind:'copy',from:['Muhasebe','Gelir_Gider.xlsx'],to:['Yedek','Gelir_Gider.xlsx'],text:'Gelir_Gider.xlsx dosyasını Yedek’e kopyalayın.'},
    {kind:'folder',to:['Muhasebe','Denetim'],text:'Muhasebe içinde Denetim adlı klasör oluşturun.'}
  ]},
  {title:'Yedekleme alma',description:'Klasörü alt dosyalarıyla birlikte kopyalayarak yedek hazırlayın.',tree:{'Belgeler':{'Rapor.docx':16384,'Notlar':{'Plan.txt':3072}},'Sunum.mp4':8388608,'Yedekler':{}},tasks:[
    {kind:'rename',from:['Yedekler'],to:['Yedek_2026'],text:'Masaüstündeki Yedekler klasörünün adını Yedek_2026 yapın.'},
    {kind:'copy',from:['Belgeler'],to:['Yedek_2026','Belgeler'],text:'Belgeler klasörünü bütün içeriğiyle Yedek_2026 içine kopyalayın.'},
    {kind:'copy',from:['Sunum.mp4'],to:['Yedek_2026','Sunum.mp4'],text:'Sunum.mp4 dosyasını Yedek_2026 içine kopyalayın.'},
    {kind:'folder',to:['Yedek_2026','Resimler'],text:'Yedek_2026 içinde Resimler adlı boş klasör oluşturun.'}
  ]},
  {title:'İndirmeler klasörünü temizleme',description:'Gereksiz dosyaları ayırın; arşivle program dosyasının farkını hatırlayın.',tree:{'Indirmeler':{'Eski_Kurulum.exe':5242880,'Gereksiz.zip':1048576,'Kilavuz.docx':22528},'Belgeler':{}},tasks:[
    {kind:'recycle',from:['Indirmeler','Eski_Kurulum.exe'],text:'Eski_Kurulum.exe dosyasını Geri Dönüşüm Kutusu’na gönderin.'},
    {kind:'permanent',from:['Indirmeler','Gereksiz.zip'],text:'Gereksiz.zip dosyasını kalıcı silin.'},
    {kind:'move',from:['Indirmeler','Kilavuz.docx'],to:['Belgeler','Kilavuz.docx'],text:'Kilavuz.docx dosyasını Belgeler’e taşıyın.'},
    {kind:'folder',to:['Indirmeler','Saklanacaklar'],text:'Indirmeler içinde Saklanacaklar adlı klasör oluşturun.'}
  ]},
  {title:'Yanlışlıkla silinen belgeyi kurtarma',description:'Önce silmeyi, ardından aynı belgeyi kutudan geri getirmeyi deneyin.',tree:{'Belgeler':{'Toplanti.docx':18432,'Taslak.txt':4096},'Yedek':{}},tasks:[
    {kind:'deletedOnce',from:['Belgeler','Toplanti.docx'],text:'Toplanti.docx dosyasını Delete ile kutuya gönderin.'},
    {kind:'restore',from:['Belgeler','Toplanti.docx'],to:['Belgeler','Toplanti.docx'],text:'Geri Dönüşüm Kutusu’nu açıp Toplanti.docx dosyasını geri yükleyin.'},
    {kind:'copy',from:['Belgeler','Toplanti.docx'],to:['Yedek','Toplanti.docx'],text:'Kurtardığınız Toplanti.docx dosyasını Yedek’e kopyalayın.'},
    {kind:'rename',from:['Belgeler','Taslak.txt'],to:['Belgeler','Toplanti_Notlari.txt'],text:'Taslak.txt adını Toplanti_Notlari.txt yapın.'}
  ]},
  {title:'Etkinlik hazırlığı',description:'Afiş, ses kaydı ve katılımcı listesiyle etkinlik klasörü kurun.',tree:{'Gelen':{'Afis.png':1572864,'Duyuru.mp3':4194304,'Liste.xlsx':16384},'Etkinlik':{}},tasks:[
    {kind:'copy',from:['Gelen','Afis.png'],to:['Etkinlik','Afis.png'],text:'Afis.png dosyasını Etkinlik klasörüne kopyalayın.'},
    {kind:'move',from:['Gelen','Duyuru.mp3'],to:['Etkinlik','Duyuru.mp3'],text:'Duyuru.mp3 dosyasını Etkinlik klasörüne taşıyın.'},
    {kind:'rename',from:['Gelen','Liste.xlsx'],to:['Gelen','Katilimcilar.xlsx'],text:'Liste.xlsx adını Katilimcilar.xlsx yapın.'},
    {kind:'folder',to:['Etkinlik','Fotograflar'],text:'Etkinlik içinde Fotograflar adlı klasör oluşturun.'}
  ]},
  {title:'Personel dosyaları',description:'Başvuru evraklarını düzenleyin ve doğru adlandırma alışkanlığı kazanın.',tree:{'Basvurular':{'Ayse_Yilmaz.docx':20480,'Mehmet_Kaya.docx':19456,'Eski_Not.txt':1024},'Personel':{},'Yedek':{}},tasks:[
    {kind:'move',from:['Basvurular','Ayse_Yilmaz.docx'],to:['Personel','Ayse_Yilmaz.docx'],text:'Ayse_Yilmaz.docx dosyasını Personel klasörüne taşıyın.'},
    {kind:'copy',from:['Basvurular','Mehmet_Kaya.docx'],to:['Yedek','Mehmet_Kaya.docx'],text:'Mehmet_Kaya.docx dosyasını Yedek’e kopyalayın.'},
    {kind:'recycle',from:['Basvurular','Eski_Not.txt'],text:'Eski_Not.txt dosyasını Geri Dönüşüm Kutusu’na gönderin.'},
    {kind:'folder',to:['Personel','Sozlesmeler'],text:'Personel içinde Sozlesmeler adlı klasör oluşturun.'}
  ]},
  {title:'Kurs materyallerini düzenleme',description:'Eğitmen için ders belgeleri, video ve kaynak klasörünü hazırlayın.',tree:{'Dersler':{'Ders1.docx':28672,'Ornek.txt':5120,'Eski_Ders.docx':8192},'Video.mp4':12582912,'Kurs':{}},tasks:[
    {kind:'rename',from:['Dersler','Ders1.docx'],to:['Dersler','Bilgisayar_Temelleri.docx'],text:'Ders1.docx adını Bilgisayar_Temelleri.docx yapın.'},
    {kind:'copy',from:['Video.mp4'],to:['Kurs','Video.mp4'],text:'Video.mp4 dosyasını Kurs içine kopyalayın.'},
    {kind:'move',from:['Dersler','Ornek.txt'],to:['Kurs','Ornek.txt'],text:'Ornek.txt dosyasını Dersler’den Kurs’a taşıyın.'},
    {kind:'folder',to:['Kurs','Kaynaklar'],text:'Kurs içinde Kaynaklar adlı klasör oluşturun.'}
  ]}
];
/* Senaryo denetçisi UI’dan bağımsızdır; otomatik testlerde de kullanılır. */
Bil.tasks = {
  // Kaynak kimliklerini ve klasör kopyalarının içeriklerini başlangıçta bağlar.
  prepare(vfs,scenario) {
    return scenario.tasks.map(task => {
      const source = task.from ? vfs.resolve(task.from) : null;
      return {...task,sourceId:source?.id,originals:source ? vfs.descendants(source.id).map(id => ({...vfs.get(id)})) : []};
    });
  },
  // Her görevi güncel durum ve gerektiğinde işlem geçmişi ile doğrular.
  check(vfs,task) {
    const target = task.to ? vfs.resolve(task.to) : null;
    const event = action => vfs.events.some(item => item.action === action && (item.id === task.sourceId || item.ids?.includes(task.sourceId)));
    if (task.kind === 'folder') return target?.type === 'folder';
    if (task.kind === 'move') return target?.id === task.sourceId && event('move');
    if (task.kind === 'rename') return target?.id === task.sourceId && event('rename');
    if (task.kind === 'recycle') return vfs.bin.some(item => item.nodes.some(node => node.id === task.sourceId)) && !vfs.get(task.sourceId);
    if (task.kind === 'deletedOnce') return event('delete');
    if (task.kind === 'restore') return target?.id === task.sourceId && event('restore');
    if (task.kind === 'permanent') return !vfs.get(task.sourceId) && !vfs.bin.some(item => item.nodes.some(node => node.id === task.sourceId)) && event('permanent');
    if (task.kind === 'copy') {
      const source = vfs.get(task.sourceId);
      if (!source || vfs.resolve(task.from)?.id !== task.sourceId || !target || target.id === source.id || target.origin !== source.origin) return false;
      const copied = vfs.descendants(target.id).map(id => vfs.get(id));
      return task.originals.every(original => copied.some(node => node.origin === original.origin && node.name === original.name && node.size === original.size));
    }
    return false;
  }
};
