# BilÖğren doğrulama kaydı

## Kapsam ve yöntem

Testler geliştirmenin yapıldığı ortamda Chromium ile çalıştırıldı. Test otomasyon araçları siteye veya projeye çalışma zamanı bağımlılığı olarak eklenmedi. Birincil test sayfası `tests/vfs.html`, harici paket olmadan tarayıcıda çalışır.

## Başarılı kontroller

- **20 veri/VFS kontrol grubu:** İki bankada tam 40'ar soru, toplam 80 farklı soru metni, her soruda dört ayrı seçenek ve açıklama; 11 kısayol, 10 uzantı; 10 senaryonun başlangıç ve tamamlanma doğrulaması; klasör alt ağacı, toplam boyut, kopya adları, taşıma/kopyalama döngü engelleri; geçersiz/çakışan adlar; kutu, üst klasör ve ad çakışması durumlarında güvenli geri yükleme; kalıcı silme ve yanlış hedef denetimi; Unicode yazma ölçümleri; RTF kaçışları.
- **40 uygulamalı görev:** On senaryonun her biri gerçek arayüzden; klasör navigasyonu, Ctrl+C/X/V, F2, yeni klasör, Delete/Shift+Delete, geri yükleme ve görevin otomatik yeşil işaretiyle 4/4 tamamlandı.
- **Sınavlar:** Seçim sonrası anında kayıt, izin açıkken yenilemede devam ve tamamlanmış sonucun geri gelmesi; izin kapatıldığında kayıt silinmesi; tek-soru/liste geçişi; 1 doğru, 1 yanlış, 38 boş için 2,5/100; final sınavında 40 doğru için 100/100; çözüm penceresi ve yanlış/boş filtreleri.
- **Gezgin:** Sağ tık ve Shift+F10 menüsü, Escape ile kapatma; kes/yapıştır, adlandırma, kopyalama, geri yükleme, kalıcı silmede vazgeçme/onaylama; gerçek dosyalara veya sisteme erişim olmaması.
- **Yazma:** Canlı karakter/kelime/doğruluk, tam metinde %100 ve tamamlandı mesajı; metin değiştirmede vazgeçme; iki Blob indirmesinde doğru dosya adları. Türkçe `İı Şş Ğğ`, süslü parantez, ters eğik çizgi ve satır sonlarının UTF-8 TXT'de korunması ve RTF'nin LibreOffice ile açılıp UTF-8 metne geri çevrildiğinde aynı içeriği vermesi.
- **Statik dağıtım:** `file://` ve yerel HTTP altında `/bilogren/` alt dizini; tüm göreli CSS/JS yolları, sekmeler ve senaryo yüklemesi; sayfa JavaScript hatası olmaması. Harici font/CDN/API isteği, sunucu kodu, package.json ve derleme yok.
- **Görsel kontroller:** 1440 px masaüstü ve 390 px mobil; konu kartları, sınav seçimi, tek soru/liste, sonuç, çözüm penceresi, gezgin, bağlam menüsü, yazma editörü. Mobilde yatay sayfa taşması yok; kısayol tablosu okunaklı satır kartlarına dönüşür. Mobil soru haritası varsayılan kapalıdır. Koyu tema kontrol edildi. Açıklama ve metin alanlarında bilinçli iç kaydırma kullanılabilir.
- **Erişilebilirlik uygulamaları:** Türkçe sayfa dili, etiketli alanlar, semantik sekmeler, ok/Home/End dolaşımı, görünür odak ve erişilebilir iletişim kutusu, en az 15 px metin ve 44 px düğmeler, büyük yazı seçeneği, azaltılmış hareket desteği, renk yanında durum metni/simgesi. Tam bir bağımsız WCAG sertifikasyonu yapılmadı.

## Bilinen kapsam sınırları

- Simülasyon Windows'un birebir işletim sistemi değildir; drag-and-drop, sistem pencereleri ve bütün Explorer özelliklerini içermez. Görev kapsamındaki sağ tık/araç çubuğu/kısayol işlemleri sağlanır.
- Win+D ve Alt+F4 tarayıcı/işletim sistemine bırakılır. Ctrl+Z konu tablosunda öğretilir fakat simülasyon geri alma geçmişi sağlamaz; silinen öğeleri kutudan geri yükleyin.
- Pratik ve yazma verileri yenilemede sıfırlanır; kalıcı sınav kaydı yalnızca izinle yapılır. Tarayıcı verilerinin silinmesi sınav kaydını da siler.
- Bir klasörün kendi içine veya alt klasörüne kopyalanması engellenir; geri yüklemede eski üst klasör yoksa önce onu geri yükleyin. Aynı ad varsa dosyalar ezilmez, işlem uyarıyla durur.
- Doğruluk konumsal eşleşme metriğidir, resmî hız sınavı değildir.
- GitHub Pages'in ilk etkinleştirilmesi bir repo yönetim ayarıdır. Workflow, bu ayar açıldıktan sonra main push'larında otomatik yayın yapar.
