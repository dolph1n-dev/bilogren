# BilÖğren

Bilgisayar kullanmaya yeni başlayan yetişkinler ve temel bilgisayar kursları için Türkçe, ücretsiz, etkileşimli eğitim platformu.

**Site:** https://dolph1n-dev.github.io/bilogren/

## Teknoloji

Saf HTML5, CSS3 ve ES6+ JavaScript. Backend, veritabanı, paket yöneticisi, derleme veya Node.js çalışma zamanı gerektirmez. Harici font, analiz, CDN ve API isteği yoktur. Kök dizindeki `index.html` doğrudan açılabilir. GitHub Pages üzerinde tüm varlıklar göreli yollarla yüklenir.

## Dört modül

- **Konu Anlatımı:** Donanım/yazılım ayrımı, sekiz donanım grubu, dosya ve klasör hiyerarşisi, boyut birimleri, aranabilir 11 kısayol, ayrıntı pencereli 10 uzantı kartı. ZIP arşivdir; EXE çalıştırılabilir dosyadır.
- **Sınavlar:** İki farklı 40 soruluk test. Tek soru/liste görünümü, anında seçim, seçimi kaldırma, soru haritası, doğru/yanlış/boş sayıları, 100 üzerinden puan ve her soru için açıklama. Yanlışlar puan düşürmez. Her doğru 2,5 puandır.
- **Masaüstü Pratik:** On gerçekçi senaryo, her birinde dört otomatik denetlenen görev. Sanal klasörler, çift tık/Enter, geri/üst klasör, adres çubuğu ve kırıntı yolu, sağ tık/Shift+F10, yeni klasör, yeniden adlandırma, kopyalama/kesme/yapıştırma, klasör alt ağacı, boyut/tür, kutu ve geri yükleme. Çoklu seçim için Ctrl, aralık için Shift; Ctrl+A tümünü seçer. Ctrl+C/X/V, Delete, F2 ve Shift+Delete yalnızca gezgin odağındayken çalışır.
- **Klavye Egzersizi:** Üç eğitsel metin, geniş editör, karakter/kelime/doğruluk/süre sayaçları, UTF-8 TXT ve Unicode kaçışlı temel RTF indirme. RTF 12 punto Arial metin üretir.

## Güvenlik ve gizlilik

Gerçek dosyalara erişilmez. EXE dahil bütün dosyalar örnek JavaScript düğümleridir. Silme ve indirme yalnızca açık kullanıcı işlemiyle yapılır; kalıcı silme onay ister. HTML'e konan kullanıcı adları kaçırılır. Klasör döngüleri ve aynı ada taşıma engellenir; kopyalarda çakışan adlar `- Kopya` olarak ayrılır. Kutudan geri yüklemede eski üst klasör yoksa önce onu geri yüklemek gerekir. Aynı ad mevcutsa uyarı verilir; veri ezilmez.

Sınav saklama **varsayılan olarak kapalıdır**. Kullanıcı açarsa `bilogren.v1.*` anahtarlarıyla yalnızca bu tarayıcıya kaydedilir. Seçenek kapatıldığında sınav kayıtları silinir. Ortak bilgisayarda kapalı tutun. Tarayıcı depolamaya izin vermezse uyarı gösterilir ve sayfa açık olduğu sürece çalışılır. Pratik alanı ve yazma metni sayfa yenilenince sıfırlanır; yazma metnini önce indirin.

Doğruluk, yazılan karakterlerin kaynakta aynı konumdaki karakterle eşleşme oranıdır; yazılmamış son bölüm cezalandırılmaz. Satır sonu, boşluk ve büyük/küçük harfler eşleşmeye dahildir. Ölçüm resmî hız sınavı değildir.

## Dosya yapısı

```text
index.html
assets/css/style.css
assets/js/core.js       # İletişim kutusu, güvenli HTML ve depolama yardımcıları
assets/js/data.js       # Eğitim içeriği ve 80 soru
assets/js/lessons.js    # Rehber kartları ve kısayol araması
assets/js/exams.js      # Sınav oturumları ve sonuç/çözüm ekranları
assets/js/vfs.js        # UI'dan bağımsız sanal dosya sistemi
assets/js/scenarios.js  # 10 senaryo ve görev denetçisi
assets/js/explorer.js   # Gezgin arayüzü ve etkileşimler
assets/js/typing.js     # Yazma ölçümleri ve Blob indirmeleri
assets/js/app.js        # Sekmeler ve erişilebilirlik tercihleri
.github/workflows/pages.yml
```

## GitHub Pages

Bu repoda Pages yayın kaynağı **GitHub Actions** olarak etkinleştirilmiştir; HTTPS zorunludur. Ek sunucu kurulumu veya kişisel token gerekmiyor.

`main` dalına her push ve elle `workflow_dispatch`, statik siteyi derleme olmadan `github-pages` ortamına yayınlar. Sadece `index.html`, `.nojekyll` ve `assets/` siteye alınır; test ve belge dosyaları yayınlanmaz. Workflow standart GitHub Pages actions kullanır, proje paket veya Node.js bağımlılığı taşımaz. Actions'ın kendi yürütücüsü bir uygulama bağımlılığı değildir.

İlk kurulumda **Settings → Pages → Build and deployment → Source: GitHub Actions** seçili olmalıdır. Varsayılan workflow token'ı ilk kez Pages etkinleştirmek için yönetim yetkisi taşımaz; bu nedenle workflow'a kişisel token veya gizli anahtar eklenmemiştir. Ardından **Actions → GitHub Pages yayınla → Run workflow** ile tekrar çalıştırın. Public repo için GitHub Pages ücretsizdir.

## Erişilebilirlik

En az 15 px metin, 44 px işlem hedefleri, semantik başlık/label/radio alanları, klavyeyle sekme gezinme, görünür odak, erişilebilir modal ve canlı durum bildirimleri bulunur. Sistem koyu tema ve azaltılmış hareket tercihi desteklenir. `A+` düğmesi yazıları büyütür. Simülasyon Windows benzeridir; Windows'un bütün özelliklerini veya kısayollarını taklit etmez. Win+D / Alt+F4 işletim sistemi veya tarayıcıya bırakılır. Ctrl+Z simülasyonda bulunmaz; geri yükleme için kutu kullanılır.

## Testler

`tests/QA.md` doğrulama kapsamını, `tests/vfs.html` dış bağımlılıksız dosya sistemi kontrollerini içerir. `tests/vfs.html` tarayıcıda açılarak tüm VFS, senaryo, soru bankası ve RTF veri kontrolleri çalıştırılabilir. Testler site yayınına dahil değildir.
