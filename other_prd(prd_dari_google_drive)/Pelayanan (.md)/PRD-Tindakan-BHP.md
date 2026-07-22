# PRD — Input Tindakan & BHP

**Related Document:** BPMN E1 Input Tindakan & BHP (hard dependency); PRD Master Data Tindakan (hard); PRD Stok (hard); PRD Billing (hard); PRD Jurnal Otomatis (soft); PRD Integrasi SISDI — RS PKU Muhammadiyah Wonosobo (soft); PRD Order Penunjang; Flowchart; Desain Figma
**Dokumen ID:** PRD-E1-Tindakan-BHP-v2.0  ·  **Versi:** 1.0 (Draft awal — dikonversi ke format generator)
**Tanggal Disusun:** 08 Juni 2026 · **Penyusun:** Team Product — Tamtech International (PIC: Elfira, System Analyst)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** [PERLU KONFIRMASI]
**Status:** Untuk Direview · **Target Release:** [PERLU KONFIRMASI] — Fase 01

> Legenda fase (dari sumber): tanpa penanda = **Fase 1** · `[**]` = **Fase 2** · `[***]` = **Fase 3** · `[****]` = **Fase 4**. Penanda `[**]` dipakai konsisten untuk seluruh item roadmap Fase 2+.

---

## 1. Overview / Brief Summary

Form Input Tindakan & BHP adalah titik pencatatan layanan klinis dan bahan habis pakai (BHP) yang menjadi **satu-satunya sumber data** untuk billing pasien, pengurangan stok, jurnal otomatis, dan pelaporan jasa medis ke pihak ketiga (mis. SISDI di RS PKU). Penggunanya adalah dokter, perawat, dan petugas penunjang (lab, radiologi, patologi, transfusi) di unit Rawat Jalan (RJ), IGD, dan Rawat Inap (RI).

Di **Neurovi v1**, form ini sudah ada namun belum mengenal paket BHP/layanan dan belum menyaring tindakan berdasarkan jenis penjamin pasien. Akibatnya petugas masih melakukan pencatatan ganda untuk BHP standar, rawan salah pilih tarif, dan stok BHP per paket tidak terkontrol.

Di **Neurovi v2**, form dirombak supaya: paket BHP/layanan terisi otomatis sesuai master tindakan & master paket `[**]`, daftar tindakan disaring sesuai jenis penjamin & unit pelayanan, stok BHP berkurang otomatis, dan validasi stok diperluas ke BHP paket `[**]` — dengan menyatukan pencatatan tindakan, billing, dan stok dalam satu transaksi yang konsisten.

**Penegasan lingkup Fase 1 (MVP):** yang aktif di Fase 1 adalah entry point 11 titik, input tindakan + Extra BHP, filter penjamin & tarif, operator cascade default, list ringkasan, validasi stok, modal konfirmasi & commit satu transaksi, auto-sync order Lab, ownership cross-module read-only, audit trail DB-only, integrasi billing, SISDI, dan jurnal otomatis. Kapabilitas paket BHP/layanan dan auto-sync Radiologi ditandai `[**]` (Fase 2).

> Referensi: BPMN E1 Input Tindakan & BHP, Desain Figma, Flowchart.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Form sudah mendukung pencatatan tindakan + Extra BHP; Extra BHP sudah mengurangi stok.
- Field Operator tampil bila tindakan memiliki jasa medis di master tindakan/layanan.
- Tindakan + BHP yang disimpan masuk ke billing pasien. Saat billing lunas, sistem mengirim data tindakan ber-jasa medis ke aplikasi SISDI RS PKU.
- **Belum ada konsep paket BHP per tindakan** — tindakan yang seharusnya menarik BHP standar harus diinput manual sebagai Extra BHP.
- **Belum ada konsep paket layanan** (kombinasi beberapa tindakan dalam satu paket harga).
- BHP yang stoknya habis (= 0) di-hide dari daftar pilih Extra BHP. Validasi stok Extra BHP sudah ada di v1 berupa modal "Stok Tidak Mencukupi" + tombol OK, dipicu saat klik "Tambah" dengan jumlah > stok tersedia.
- **BHP gas medis sudah didukung di Extra BHP** — saat BHP gas medis dipilih, form menampilkan field Kecepatan gas (satuan lpm), Durasi Pakai (satuan menit), Jumlah (satuan mengikuti BHP terpilih, terisi otomatis = Kecepatan gas × Durasi Pakai), dan Operator. Perilaku ini sudah berjalan di v1.
- **Daftar tindakan belum disaring berdasarkan jenis penjamin** — petugas bisa salah pilih tarif (mis. memilih tarif umum padahal pasien BPJS).

**Masalah / pain point:**
- Aspek bisnis proses: pencatatan ganda BHP standar; kombinasi tindakan dipilih satu per satu.
- Aspek UX: petugas harus cek tarif manual dan rawan salah pilih penjamin.
- Aspek logic system: stok BHP per paket tidak terkontrol; validasi stok belum mencakup BHP paket; integrasi billing–stok belum dijamin real-time dalam satu transaksi konsisten.

**Dampak utama yang disasar v2:**
- Data billing, stok, dan jurnal selalu konsisten dengan kejadian klinis · mengurangi pencatatan ganda · mencegah salah tarif · memastikan stok sebelum simpan · integrasi real-time billing & inventory.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = form input tindakan & Extra BHP, filter penjamin, operator cascade, list ringkasan + commit satu transaksi, auto-sync order Lab, ownership cross-module, audit trail, billing, SISDI, jurnal.
- **Fase 2** = paket BHP otomatis, paket layanan otomatis, validasi stok seluruh BHP (paket + extra), auto-sync order Radiologi. `[**]`
- **Fase 3** = evaluasi auto-sync order ke Modul Patologi Anatomi. `[***]`
- **Fase 4** = enhancement/inovasi masa depan (legend). `[****]` [PERLU KONFIRMASI cakupan]

> Perilaku target: 100% pasien yang selesai/dipulangkan pasti terisi tindakannya.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Entry point 11 titik** — membuka form dari 7 titik di modul Pelayanan (Form Asesmen sebagai shortcut, Icon Tindakan & BHP, E-Resep, dan shortcut Order Lab / Patologi / Radiologi / Permintaan Darah pada Dashboard Pelayanan) + 4 Icon di modul penunjang (Laboratorium, Radiologi, Patologi Anatomi, Transfusi Darah).
2. **Input tindakan** — isi tanggal/waktu, pencarian & pemilihan tindakan (searchable dropdown, terfilter tipe penjamin + kelas + unit), isi jumlah.
3. **Aturan backdate per unit** — RJ/IGD tidak boleh backdate; RI boleh backdate sampai tanggal admisi.
4. **Dropdown tindakan disaring** berdasarkan tipe penjamin + kelas + unit (RJ/IGD: kelas "Tidak Ada"; RI: kelas sesuai penentuan modul RI), menampilkan nama tindakan tanpa harga.
5. **Field Operator otomatis** sebanyak jasa medis di master, autofill default per unit pelayanan (RJ = DPJP ke semua baris; IGD/penunjang/RI = user login; IBS/VK = tanpa autofill); dropdown pilihan operator menampilkan semua role tanpa filter (Fase 1); bisa edit/kosongkan, kosong saat Tambah → user login; tanpa blocking. `[**]` penyesuaian autofill & pilihan operator per role = Fase 2.
6. **List ringkasan** tanpa informasi harga dan **tanpa tag perubahan**; berisi item dengan aksi edit/hapus. Tag perubahan (Penambahan/Edit/Hapus) muncul di **modal konfirmasi** setelah klik Simpan.
7. **Extra BHP** — pilih BHP/alkes, isi jumlah, satu field Operator otomatis tampil (label "Operator", tidak per jasa medis), validasi stok saat klik Tambah (mengikuti perilaku v1).
8. **Simpan** — Modal Konfirmasi Pre-Save (ringkasan perubahan), lalu validasi ulang stok, commit satu transaksi (tindakan + Extra BHP), kurangi stok, kirim charge ke Billing.
9. **Auto-sync order Lab** — order Laboratorium dari Modul Pelayanan ter-load otomatis saat petugas lab konfirmasi order; item auto-sync terkunci.
10. **Module Ownership & Cross-Module Read-Only** — setiap record di-tag `source_module`; item modul lain tampil read-only.
11. **Harga tidak ditampilkan di form** — informasi harga (harga satuan, subtotal, total) dihilangkan dari dropdown tindakan, list ringkasan, dan modal konfirmasi untuk semua tenant. Data tarif tetap diproses backend untuk billing & jurnal. (Flag `tampilkan_tarif_di_form_tindakan` di-retire untuk tujuan tampilan.)
12. **Integrasi billing** — tindakan + Extra BHP otomatis masuk sebagai item charge (mengikuti v1).
13. **Integrasi SISDI** (config per client, aktif hanya RS PKU) — kirim data tindakan ber-jasa medis dokter saat billing lunas (mengikuti v1).
14. **Trigger jurnal otomatis** (config per client) saat tindakan & BHP tersimpan — mapping akun di PRD Jurnal Otomatis.
15. **Audit trail** di database (tidak ditampilkan ke user, hanya untuk investigasi via DB).
16. **Update dashboard pasien** (icon checklist) setelah tindakan tersimpan.
17. **BHP gas medis (perhitungan jumlah otomatis) — mengikuti perilaku v1** — saat BHP jenis gas medis dipilih di section Extra BHP, tampil field **Kecepatan gas** (satuan lpm), **Durasi Pakai** (satuan menit), **Jumlah** (satuan mengikuti BHP terpilih, terisi otomatis = Kecepatan gas × Durasi Pakai), dan **Operator**.

### Scope Definition (Fase 2) `[**]`
- Tindakan ber-paket BHP → BHP paket terisi otomatis (hanya tampil, tidak dapat diubah) + stok berkurang saat simpan.
- Tindakan ber-paket layanan → tindakan komponen terisi otomatis sebagai item terpisah dengan tarif paket.
- Notifikasi visual: "Paket BHP/layanan terisi otomatis dari master tindakan dan master paket. Gunakan section Extra BHP untuk BHP tambahan di luar paket."
- Validasi stok untuk seluruh BHP (paket + extra).
- Auto-sync order Radiologi (pola sama dengan Lab).
- **Penyesuaian operator per role** — autofill DPJP/staf dan pilihan dropdown operator disesuaikan/di-filter per role jasa medis (di Fase 1 semua diisi ke semua baris & dropdown tampil semua role).

### Out Scope
1. Pengelolaan master tindakan/layanan dan master BHP — di PRD Master Data terpisah.
2. Pengaturan paket BHP & paket layanan di master tindakan — di PRD Master Data terpisah.
3. Pembuatan order pemeriksaan penunjang — di PRD Order Penunjang; modul ini hanya menerima order untuk dicatatkan tindakannya.
4. Mapping akun jurnal untuk tindakan & BHP — di PRD Jurnal Otomatis.
5. UI tampilan riwayat aktivitas ke user — Fase 1 hanya pencatatan di database.
6. Pembayaran billing & pelunasan — di PRD terpisah.
7. Pengaturan jasa medis dokter dan tarif per kelas/penjamin di master data tindakan.
8. Penanganan retur BHP — di modul terpisah.
9. **Auto-sync order ke Modul Patologi Anatomi** — belum ada di Fase 1 & 2; input manual. Masuk roadmap Fase 3 / evaluasi terpisah. `[***]`
10. **Auto-sync order ke Modul Transfusi Darah** — sama dengan Patologi: tidak ada auto-sync di Fase 1 & 2; roadmap evaluasi.

## 4. Goals and Metrics

### Tujuan
1. Menjadi titik pencatatan tindakan & BHP yang menjaga data billing, stok, dan jurnal selalu konsisten dengan kejadian klinis di lapangan. 
2. Mengurangi pencatatan ganda (BHP standar) melalui paket BHP otomatis `[**]`. 
3. Mencegah salah tarif melalui penyaringan tindakan otomatis per jenis penjamin & kelas.
4. Serta memberi kepastian stok BHP sebelum simpan sehingga petugas tidak menemukan kegagalan saat commit.

### Metrik (terukur)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Akurasi penjamin | 0 kasus tindakan tercatat dengan tarif tidak sesuai jenis penjamin pasien | BR-005, BR-007; NFR-016 |
| Waktu input tindakan | < 60 detik dengan paket BHP (Fase 2 `[**]`); < 90 detik dengan Extra BHP (Fase 1) | FR-006, FR-008 |
| Konsistensi billing | 100% tindakan & BHP tersimpan muncul di billing dalam < 5 detik | NFR-006 |
| Akurasi stok | Selisih stok fisik vs sistem ≤ 2% per audit bulanan | FR-009 |
| Keandalan SISDI (RS PKU) | > 99% tindakan ber-jasa medis dokter berhasil terkirim ke SISDI saat billing lunas | NFR-009 |
| Kelengkapan pencatatan | 100% pasien yang dipulangkan terisi tindakannya | Goal user |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|----------------------|
| **Master Data** | Sumber data tindakan/layanan, BHP, staf (operator), tipe penjamin, bangsal. |
| **Pelayanan** | Asesmen RJ/IGD/RI, dashboard pasien — sumber entry point & konteks pasien. |
| **Penunjang** | Order Lab, Order Radiologi, dll — event source auto-sync. |
| **Stok / Inventory** | Informasi stok, validasi & mutasi stok-out. |
| **Billing** | Konsumen charge tindakan & BHP (tagihan pasien). |
| **Keuangan** | Jurnal otomatis (konsumen event `tindakan_bhp_disimpan`). |
| **Integrasi Eksternal** | SISDI (RS PKU only). |

Dependency lintas modul: **Master Data Tindakan**, **Master Data Staf** (operator), **Master Data BHP/Farmasi**, **Stok**, **Billing**, **Order Penunjang**, **Event bus**.

### B. Persona
| Persona | Tipe | Peran terhadap Modul |
|---------|------|----------------------|
| Dokter / Perawat (Pelayanan) | Primary | Input tindakan & Extra BHP, edit/hapus sebelum lunas. |
| Petugas Penunjang (Lab / Radiologi / Patologi / Transfusi) | Primary | Konfirmasi order, catat tindakan penunjang, tambah Extra BHP. |
| Apoteker | Secondary | Menjaga stok sinkron; mutasi stok-out otomatis. |
| Kasir (Billing) | Secondary | Menerima charge otomatis di tagihan. |
| Akuntan (Keuangan) | Secondary | Menerima jurnal otomatis real-time. |
| Admin Sistem / Auditor Internal | Tersier | Investigasi via audit trail DB. |
| Manajemen RS PKU | Tersier | Menerima data remunerasi via SISDI. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Dokter/perawat klik tombol Input Tindakan & BHP di dashboard pasien atau dari form asesmen.
2. Pilih tindakan dari daftar **tanpa filter jenis penjamin** — tarif yang muncul bersifat umum.
3. Isi jumlah; jika tindakan punya jasa medis, field Operator muncul satu per jasa.
4. (Opsional) Centang Extra BHP, pilih BHP (stok 0 di-hide), satu field Operator otomatis tampil (label "Operator", tidak per jasa medis),isi jumlah, klik Tambah → sistem cek stok real-time; bila kurang muncul modal "Stock Tidak Mencukupi" + OK (hard-block)..
5. Klik Simpan → sistem menyimpan, kurangi stok Extra BHP, posting charge ke billing.
6. Saat billing lunas, sistem kirim data tindakan ber-jasa medis ke SISDI.
7. Tidak ada paket BHP — BHP standar diinput manual sebagai Extra BHP.
8. Tidak ada paket layanan — kombinasi tindakan dipilih satu per satu.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Entry point sama (asesmen / dashboard pasien / penunjang).
2. Daftar tindakan disaring otomatis berdasarkan tipe penjamin + kelas + unit (RJ/IGD: kelas "Tidak Ada"; RI: penentuan kelas di modul RI); daftar tampil tanpa harga.
3. Bila tindakan punya paket BHP, BHP paket terisi otomatis (hanya tampil, tidak dapat diubah) + notifikasi. `[**]`
4. Bila tindakan punya paket layanan, tindakan komponen masuk sebagai item terpisah di list ringkasan. `[**]`
5. Operator otomatis muncul sebanyak jasa medis; autofill default per unit pelayanan (RJ DPJP ke semua baris, IGD/penunjang/RI user login, IBS/VK tanpa autofill); dropdown operator tampil semua role (Fase 1); bisa edit/ganti/kosongkan manual.
6. (Opsional) Centang Extra BHP, pilih BHP (stok 0 di-hide), satu field Operator otomatis tampil (label "Operator", tidak per jasa medis),isi jumlah, klik Tambah → sistem cek stok real-time; bila kurang muncul modal "Stock Tidak Mencukupi" + OK (hard-block).; validasi stok proaktif saat tambah ke list dan saat simpan.
7. Klik Simpan → satu transaksi: simpan tindakan + paket BHP `[**]` + Extra BHP, kurangi stok seluruhnya, posting charge ke billing, trigger jurnal otomatis, catat audit trail.
8. SISDI tetap tertrigger saat billing lunas (RS PKU only).

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Filter tindakan | Tanpa filter penjamin (tarif umum) | Disaring tipe penjamin + kelas + unit (RJ/IGD kelas "Tidak Ada"; RI kelas via modul RI) |
| Paket BHP | Tidak ada (manual Extra BHP) | Otomatis dari master, locked `[**]` |
| Paket layanan | Tidak ada (pilih satu per satu) | Otomatis pecah komponen, tarif flat `[**]` |
| Validasi stok | Extra BHP saja | Extra BHP + paket BHP `[**]` |
| Commit | Simpan → stok + billing | Satu transaksi: tindakan + BHP + stok + billing + jurnal + audit |
| Order penunjang | Manual | Auto-sync Lab (Fase 1), Radiologi (Fase 2 `[**]`) |
| Cross-module | — | Ownership `source_module` + read-only view |
| Tarif display | Selalu tampil | Tidak ditampilkan di form (dropdown, ringkasan, modal); tarif backend-only |

## 7. Main Flow / Mindmap

> Sumber alur: **BPMN E1 — Input Tindakan & BHP** (tiga lane: User Pelayanan/Penunjang · Sistem Neurovi · Stock Management). Ringkasan berikut merapikan alur BPMN ke skenario naratif.

### Skenario 1 — Input tindakan reguler (alur utama)
1. User membuka form dari salah satu entry point → header pasien terisi otomatis, `source_module` ter-set.
2. Isi Tanggal & Waktu (default hari ini / jam server, tunduk aturan backdate).
3. Cari & pilih tindakan (searchable, terfilter tipe penjamin + kelas + unit, tanpa harga).
4. Isi Jumlah; field Operator muncul otomatis per jasa medis dengan autofill default sesuai unit pelayanan (BR-014).
5. Klik **Tambah** → item masuk list ringkasan (staging) tanpa harga; field kiri di-reset (tanggal & waktu tetap).
6. Ulangi untuk tindakan lain bila ada.
7. Review ringkasan → klik **Simpan** → **Modal Konfirmasi Pre-Save**.
8. Konfirmasi [SIMPAN] → validasi final → commit satu transaksi → notifikasi "Data tersimpan" → update dashboard pasien (icon checklist).

### Skenario 2 — Tambah Extra BHP
1. Centang checkbox **Extra BHP** → field BHP & jumlah aktif.
2. Pilih BHP (daftar hanya stok > 0, tampil "Nama — Stok Tersedia"), isi jumlah pemakaian, satu field Operator otomatis tampil (label "Operator", tidak per jasa medis).
3. Klik **Tambah** → **validasi stok** (FR-010): bila cukup → item masuk list; bila kurang → modal "Stock Tidak Mencukupi" (hard-block, tombol OK).
4. **Bila BHP yang dipilih berjenis gas medis**: form menampilkan field tambahan **Kecepatan gas** (lpm) dan **Durasi Pakai** (menit). Field **Jumlah** terisi otomatis = Kecepatan gas × Durasi Pakai, satuan mengikuti BHP (mis. 3 lpm × 60 menit = 180 liter) dan tidak diinput manual. Petugas memilih **Operator**, lalu klik **Tambah** → validasi stok (FR-010) memakai Jumlah hasil hitung.

### Skenario 3 — Paket BHP / paket layanan `[**]`
- Saat tindakan dipilih, Sistem cek master: punya paket BHP? → section "BHP Paket Tindakan" muncul (locked, read-only) + notifikasi.
- Punya paket layanan? → komponen masuk sebagai item terpisah dengan tag "Paket: [Nama]", tarif paket flat.
- Saat commit, stok paket BHP ikut berkurang (hard-block bila minus).

### Skenario 4 — Edit / hapus & commit
- Edit item → data kembali ke field input, tombol berubah "Update"; perubahan tercatat sebagai **Edit** (item DB) / tetap **Penambahan** (item baru) — tag tampil di modal saat Simpan.
- Hapus item belum tersimpan → langsung hilang; item tersimpan → dikeluarkan dari list dan di-**soft delete** saat commit (tag Hapus muncul di modal saat Simpan).
- Commit: simpan record → detail BHP → charge billing → mutasi stok → audit trail → publish event bus (`tindakan_bhp_disimpan` / `_diubah` / `_dihapus`). Gagal di salah satu → rollback semua.
- Edit/hapus setelah tersimpan diizinkan **selama tagihan belum lunas**; setelah lunas record dikunci (koreksi via Refund/Reversal Billing — out of scope).

### Skenario 5 — Auto-sync order penunjang (Lab, Fase 1)
1. Petugas Pelayanan buat Order Laboratorium → status "Baru".
2. Petugas Lab buka Modul Laboratorium → Worklist → pilih order → klik **Konfirmasi Order**.
3. Form terbuka: header pasien terisi, tindakan auto-fill dari order (tiap pemeriksaan = 1 item, jumlah 1, tarif sesuai penjamin, operator = user login). Item auto-fill **terkunci**.
4. Petugas Lab boleh tambah Extra BHP → **Simpan** (alur sama FR-011).
5. Saat commit, status order lab → "Selesai (Pencatatan)"; hasil pemeriksaan dicatat terpisah di modul Lab.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Aturan backdate per unit: RJ & IGD tidak boleh backdate (tanggal sebelum hari ini di-disable, waktu boleh diubah dalam hari yang sama); RI boleh backdate maksimum sampai tanggal kunjungan/admisi, tidak boleh post-date. | FR-002; US-002 |
| **BR-002** | Datepicker membatasi pilihan sesuai aturan unit — tanggal tidak valid di-disable. | FR-002 |
| **BR-003** | Format tampilan: tanggal `DD/MM/YYYY`, waktu `HH:MM` (24 jam). | FR-002 |
| **BR-004** | Audit trail mencatat tanggal/waktu input (dipilih user) vs timestamp server saat simpan. | FR-002; FR-014 |
| **BR-005** | Penyaringan tindakan berdasarkan **tipe penjamin + kelas + unit pelayanan**. **RJ & IGD** = tipe penjamin + kelas **"Tidak Ada"** + unit. **RI** = tipe penjamin + kelas + unit; penentuan *kelas mana* yang dipakai (Sesuai kelas / Titip kelas / Naik kelas) di-handle di modul RI — lihat BR-065. Sumber = master tindakan yang di-set per tipe penjamin & kelas. | FR-003; US-003 · BR-065 |
| **BR-006** | Daftar tindakan pasien Umum tidak menampilkan tindakan yang hanya di-set untuk BPJS, dan sebaliknya. | FR-003 |
| **BR-007** | Tarif yang ditampilkan = tarif sesuai jenis penjamin pasien (cross-check dengan master). | FR-003 |
| **BR-008** | Pasien BPJS + tindakan masuk paket INA-CBG → tarif yang muncul tetap **tarif rumah sakit**. Tarif RS dipakai untuk perhitungan internal & jasa medis; tarif INA-CBG dihitung dari sisi billing/klaim. | FR-003 |
| **BR-009** | **Informasi harga tidak ditampilkan di form** untuk semua tenant: harga satuan, subtotal, dan total dihilangkan dari dropdown tindakan, list ringkasan, dan modal konfirmasi. Data tarif tetap diproses backend (charge billing, jurnal). Flag `tampilkan_tarif_di_form_tindakan` di-retire untuk tujuan tampilan. | FR-003; FR-006; FR-011 |
| **BR-010** | Jumlah tindakan hanya integer, minimum 1; input non-integer/negatif ditolak. | FR-004; US-004 |
| **BR-011** | Bila tindakan punya jasa medis, jumlah baris Operator tetap 1 per jasa medis (tidak dikalikan jumlah tindakan); operator yang sama berlaku untuk semua kuantitas. (Sesuai v1.) | FR-004 |
| **BR-012** | Charge ke billing = tarif × jumlah. | FR-004; FR-016 |
| **BR-013** | Field Operator muncul sebanyak jasa medis di master (label = nama jasa medis, mis. "Dokter Anestesi"). 0 jasa medis → field tidak muncul. | FR-005; US-005 |
| **BR-014** | **Autofill default operator (section Tindakan) bergantung unit pelayanan** — lihat matriks di §12 Data Requirements Section C. Ringkas: **RJ** = nama dokter DPJP (DPJP utama kunjungan) diisi ke **semua baris** jasa medis (tanpa filter role di Fase 1); bila DPJP tidak tersedia → field kosong, terisi user login saat Tambah (BR-016). **IGD, Radiologi, Laboratorium, Transfusi Darah, Patologi Anatomi, RI** = user login untuk semua baris. **IBS & VK** = tanpa autofill (field dibiarkan kosong). Autofill terjadi saat tindakan dipilih, berlaku ke semua baris jasa medis. `[**]` Penyesuaian autofill & pilihan operator per role = enhancement Fase 2. | FR-005 |
| **BR-015** | Override manual: user bisa pilih staf manapun dari daftar operator. **Fase 1**: dropdown menampilkan **semua role/staf tanpa filter** (sumber Master Data Staf). `[**]` **Fase 2**: dropdown & autofill dapat disesuaikan/di-filter per role. | FR-005 |
| **BR-016** | Field Operator (section Tindakan maupun Extra BHP) boleh **di-clear / dikosongkan** di form; tidak ada blocking validation "Operator wajib". Namun saat item **ditambah ke list ringkasan** dengan operator kosong, sistem mengisi otomatis dengan **user login**. Jadi operator tidak pernah kosong di ringkasan. | FR-005; FR-022 |
| **BR-017** | Sumber DPJP = DPJP utama kunjungan (di RI multi-DPJP, default = DPJP utama). Sumber user login = staf yang sedang login (identitas dari session/JWT, bukan input form). | FR-005 |
| **BR-018** | Tombol Tambah disable bila ada field wajib belum terisi. | FR-006 |
| **BR-019** | Harga satuan, subtotal per item, dan Total Keseluruhan **tidak ditampilkan** di list ringkasan maupun modal. Nilai charge tetap dihitung backend saat commit (per tindakan = tarif × jumlah; lihat BR-012, BR-055) untuk billing & jurnal. | FR-006; FR-016 |
| **BR-020** | Sumber tarif untuk charge backend (tidak ditampilkan): Tindakan = tarif per jenis penjamin × kelas; Extra BHP = harga jual BHP dari modul stok per unit pelayanan; **`[**]`** Tindakan berpaket = tarif paket flat dari master paket. | FR-016 |
| **BR-021** | **`[**]`** BHP paket tidak di-charge per item (roll-up ke tarif paket tindakan induk); stok tetap dikurangi. Karena harga tidak ditampilkan, tidak ada indikator subtotal paket di list. | FR-016; FR-019 |
| **BR-022** | Perhitungan charge untuk pasien BPJS bersifat estimasi internal (actual klaim INA-CBG dihitung di sisi billing); nilai ini **tidak ditampilkan** di form. | FR-016 |
| **BR-023** | Item di list belum tersimpan ke DB (state lokal form); list re-render otomatis saat tambah/edit/hapus. Tidak ada subtotal/total yang dihitung untuk ditampilkan. | FR-006; FR-007 |
| **BR-024** | Item read-only dari modul lain tampil tanpa icon edit/hapus, memberi konteks lengkap tindakan kunjungan; tidak ada nilai harga/total yang ditampilkan. | FR-006; FR-013 |
| **BR-025** | Setiap item punya tag perubahan: **Penambahan** (baru di session ini, belum di DB) / **Edit** (item DB yang dimodifikasi) / **Hapus** (item DB yang akan dihapus). Tag **tidak ditampilkan di list ringkasan**; hanya muncul di **modal konfirmasi** (kolom Perubahan) setelah user klik Simpan. | FR-007; US-007 |
| **BR-028** | Untuk Extra BHP yang di-edit, validasi stok dijalankan ulang. Tidak ada efek samping ke stok/billing sebelum commit. | FR-007; FR-010 |
| **BR-029** | Sumber data BHP = stok unit pelayanan tempat user login (bukan gudang utama). Hanya BHP stok > 0 yang muncul; stok 0 di-hide (mengikuti v1). Visibility BHP habis dikelola di modul Stok. | FR-008; US-008 |
| **BR-030** | BHP yang sudah ada di list ringkasan tetap bisa dipilih lagi (multiple line); sistem tidak menggabungkan otomatis. | FR-008 |
| **BR-031** | **BHP gas medis — jumlah otomatis**: bila BHP berjenis gas medis, Jumlah = **Kecepatan gas (lpm) × Durasi Pakai (menit)**, satuan hasil mengikuti satuan BHP (mis. liter). Field Jumlah terisi otomatis dari kedua input dan tidak diinput manual. Contoh: 3 lpm × 60 menit = 180 liter. | FR-022; US-022 |
| **BR-032** | Pengurangan stok dilakukan dalam **satu database transaction** yang sama dengan simpan tindakan & posting charge. Bila salah satu gagal, rollback semua. | FR-009; FR-011 |
| **BR-033** | Stok tidak boleh negatif. Bila race condition menyebabkan stok negatif saat commit → rollback + modal "Stock Tidak Mencukupi" ("[Nama BHP] Tidak Mencukupi (stok berubah karena user lain). Sisa Stok sekarang: X [satuan]. Refresh data BHP dan coba lagi." + [OK]). | FR-009; FR-011; R1 |
| **BR-034** | Mutasi stok-out mencatat: nama barang, expired, tgl transaksi, ID transaksi tindakan, jenis transaksi, informasi stok (awal/masuk/keluar/sisa), satuan, pasien, unit, user pencatat, timestamp. | FR-009 |
| **BR-035** | Validasi stok Extra BHP dipicu **saat klik Tambah** (bukan saat keluar field jumlah, bukan saat Simpan). Hard-block: tidak ada opsi "Tetap Tambah" / "Tambah dengan flag warning" — bila stok kurang, item wajib dibatalkan atau jumlah dikecilkan. | FR-010; US-010 |
| **BR-036** | "Stok tersedia" = stok aktual unit pelayanan saat login **dikurangi qty BHP sama yang sudah di list** tapi belum di-commit (tentative deduction di session, bukan lock DB). Contoh: stok 810, sudah 2 di list → tersedia 808. | FR-010 |
| **BR-037** | Nama BHP di pesan validasi = nama lengkap master, termasuk merek/program (mis. "Alkohol Swab (SENSI) (FORNAS)"). | FR-010 |
| **BR-038** | Modal Konfirmasi Pre-Save **wajib** muncul setiap klik Simpan (tidak ada toggle "jangan tampilkan lagi", mengikuti v1 untuk audit trail visual). | FR-011; US-011 |
| **BR-039** | Satu klik [SIMPAN] di modal = satu transaksi DB (BEGIN…COMMIT); tidak boleh partial save. Lock UI saat commit mencegah double-click. | FR-011 |
| **BR-041** | Bila data list berubah karena background event saat modal terbuka (mis. polling stok mendeteksi kekurangan), modal otomatis tertutup + notifikasi: "Data list ringkasan berubah. Mohon review ulang sebelum simpan." | FR-011 |
| **BR-042** | Langkah commit: (a) simpan record tindakan (create untuk Penambahan / update untuk Edit / **soft delete** untuk Hapus — bukan hard delete), (b) simpan detail BHP (Extra BHP Fase 1; + BHP paket Fase 2 `[**]`), (c) generate charge billing (qty×tarif / adjust / reverse), (d) mutasi stok (out / adjust delta / return), (e) catat audit trail per aksi, (f) publish event bus. Gagal di salah satu → rollback semua. | FR-011 |
| **BR-043** | Edit/hapus tindakan setelah tersimpan diizinkan **selama tagihan pasien belum lunas**. Setelah lunas, record dikunci; koreksi hanya via modul Refund/Reversal Billing (out of scope). Sistem cek status pembayaran ke Billing sebelum membuka mode edit. | FR-011 |
| **BR-044** | Auto-sync **hanya untuk Modul Laboratorium** (Fase 1, sesuai v1). Radiologi = Fase 2 `[**]`. Patologi Anatomi & Transfusi Darah = tidak ada auto-sync di Fase 1 & 2 (input manual). | FR-012 |
| **BR-045** | Item auto-fill dari order penunjang yang sudah dikonfirmasi tampil **read-only & terkunci** di semua modul (tidak bisa dihapus petugas lain). | FR-012; FR-001 |
| **BR-046** | Order dengan banyak pemeriksaan → semua masuk sebagai tindakan terpisah di list (kecuali sudah dikemas sebagai paket layanan Fase 2 `[**]`). | FR-012 |
| **BR-048** | Field DB `source_module` (enum: `PELAYANAN`, `LABORATORIUM`, `RADIOLOGI`, `PATOLOGI_ANATOMI`, `TRANSFUSI_DARAH`) di-set otomatis saat record dibuat sesuai entry point; menentukan siapa yang bisa edit/hapus record. | FR-013; FR-001 |
| **BR-049** | Form load semua record Tindakan & BHP untuk kunjungan tsb, terlepas `source_module`. Item `source_module` == current → editable; ≠ current → read-only + badge "Dari Modul [Nama]", warna baris muted / icon lock. | FR-013 |
| **BR-051** | Koreksi item read-only harus dari modul sumbernya; tidak ada mekanisme override lintas modul. | FR-013 |
| **BR-052** | Audit trail mencatat `user_id` (pembuat record) terpisah dari `source_module` (modul tempat dibuat). | FR-013; FR-014 |
| **BR-053** | Setiap commit menghasilkan record `audit_log`: timestamp server, user_id & nama, action_type (CREATE/EDIT/DELETE _TINDAKAN & _BHP), entity reference (pasien, kunjungan, tindakan/BHP ID), before/after value (untuk EDIT), IP address & user agent. Retention default ≥ 5 tahun (data medis). Tidak ada UI Fase 1. | FR-014; US-014 |
| **BR-054** | Setelah commit sukses, flag "Tindakan & BHP Tercatat" di-update + icon Tindakan di Dashboard Pasien jadi checklist. Indikator hanya menunjukkan minimal 1 tindakan tercatat (bukan jumlah/detail). Reset bila semua tindakan dihapus. | FR-015; US-015 |
| **BR-055** | Charge billing via event: per tindakan = qty × tarif jenis penjamin; per Extra BHP = qty × harga jual BHP. **`[**]`** BHP paket tidak di-charge per item (roll-up ke tarif paket tindakan induk, 1 baris tagihan); stok BHP paket tetap dikurangi untuk inventory & jurnal. | FR-016; US-016 |
| **BR-057** | Integrasi SISDI config per tenant (`integrasi_sisdi_aktif` = true hanya RS PKU; tenant lain false). Saat billing lunas di RS PKU, worker SISDI mengambil semua tindakan ber-jasa medis dokter dan mengirim sesuai kontrak interface v1. Gagal → retry backoff + log error + alert admin. | FR-017; US-017 |
| **BR-059** | **`[**]`** BHP paket hanya tampil (locked) — user tidak bisa edit jumlah / hapus item paket. Qty default dari master tindakan. Adjustment harus lewat Extra BHP. Validasi stok BHP paket dijalankan saat Simpan (FR-011). | FR-019; US-019 |
| **BR-060** | **`[**]`** Stok minus tidak diizinkan untuk BHP paket (hard-block saat Simpan). Bila stok paket kurang, user harus: (a) lengkapi stok via modul Stok, atau (b) pindahkan BHP kurang ke section Extra BHP untuk di-adjust manual. Rasional: paket = klinis terstandar; stok minus mengacaukan rekonsiliasi inventory. | FR-020; US-020 |
| **BR-061** | **`[**]`** Paket layanan → komponen masuk sebagai item terpisah dengan tag "Paket: [Nama]". Tarif = tarif paket flat sesuai penjamin (bukan jumlah komponen); tarif komponen di list hanya display. User tidak bisa hapus komponen individual — hanya hapus paket keseluruhan. Fitur paket BHP (FR-019) berlaku rekursif per komponen. | FR-021; US-021 |
| **BR-063** | **Deteksi gas medis & field kondisional** (mengikuti v1): sistem mengenali BHP gas medis dari kategori/penanda jenis di master BHP. Bila gas medis → tampil field Kecepatan gas (lpm), Durasi Pakai (menit), dan Operator; field Jumlah menjadi read-only (hasil hitung BR-031). Bila BHP biasa → field khusus ini tidak tampil dan Jumlah diinput manual seperti biasa. Detail mekanisme penandaan jenis di master mengikuti implementasi v1. | FR-022; US-022 |
| **BR-065** | **Penentuan kelas untuk penyaringan tindakan RI** `[Handled di modul/sprint Rawat Inap]` — di modul ini cukup di-mention bahwa case berikut akan di-handle saat modul RI: (a) **Sesuai kelas** = filter sesuai kelas bawaan tipe penjamin (mis. pasien BPJS kelas 1 → tampilkan tindakan tipe penjamin BPJS, kelas 1); (b) **Titip kelas** = pasien dititipkan di bangsal kelas lain, tetapi filter tetap mengikuti kelas asli tipe penjamin (mis. BPJS kelas 1 ditempatkan di bangsal VIP → tetap tampilkan tindakan BPJS kelas 1); (c) **Naik kelas** = filter mengikuti kelas terbaru setelah naik kelas (mis. BPJS kelas 1 naik ke VIP → tampilkan tindakan sesuai kelas VIP). Sumber data status kelas pasien & implementasi detail = modul RI. | FR-003; BR-005 |
| **BR-066** | **Operator di section Extra BHP** — otomatis tampil sebagai **satu** field berlabel "Operator" (tidak muncul sebanyak jasa medis seperti section Tindakan). Autofill mengikuti matriks per unit pelayanan (BR-014, §12 Section C); boleh dikosongkan, kosong saat Tambah → user login (BR-016). Berlaku untuk semua BHP di Extra BHP (termasuk gas medis). | FR-008; FR-022 |

## 9. State Machine — Tag Perubahan (ditampilkan di Modal Konfirmasi)

### 9.1 Tiga kondisi tag perubahan
> Tag **hanya ditampilkan di modal konfirmasi** (kolom Perubahan) setelah klik Simpan — **tidak** di list ringkasan. Di list tidak ada penanda tag; item yang dihapus dikeluarkan dari list (di-soft delete saat commit) dan tercatat sebagai Hapus di modal.

| State | Encoding Visual (di modal) | Makna |
|-------|-----------------|-------|
| **Penambahan** | Badge (mis. hijau) | Item baru ditambahkan di session ini, belum ada di DB. |
| **Edit** | Badge (mis. biru) | Item sudah ada di DB, dimodifikasi di session ini (qty/operator/tindakan diubah). |
| **Hapus** | Badge (mis. merah) | Item DB yang akan dihapus (soft delete) saat commit. |

- **Transisi (berbasis aksi user, dihitung di state form):**
  - Tambah item baru → **Penambahan**.
  - Edit item DB (klik pensil → Update) → **Edit**; edit item baru → tetap **Penambahan**.
  - Hapus item DB → dikeluarkan dari list, tercatat **Hapus** (tampil di modal), di-soft delete saat commit; hapus item baru → langsung hilang.

### 9.2 State order penunjang (auto-sync)
- `Baru` (order dibuat di Pelayanan) → `Selesai (Pencatatan)` (saat commit di form Tindakan & BHP modul penunjang). Hasil pemeriksaan dicatat terpisah di modul penunjang.

### 9.3 State record terhadap Billing
- Record editable **selama tagihan belum lunas** → setelah **lunas**, record **terkunci** (koreksi hanya via Refund/Reversal Billing — out of scope). (BR-043)

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Entry point 11 titik** — form terbuka sebagai overlay/dialog dari 7 titik Pelayanan + 4 Icon penunjang; header pasien terisi otomatis (min: No RM, Nama, Tgl Lahir + Umur, Jenis Penjamin); `source_module` ter-set sesuai entry point. Form selalu dalam konteks 1 pasien + 1 unit pelayanan + 1 jenis penjamin aktif. Item tersimpan modul lain tampil read-only. | US-001; BR-045, BR-048 |
| **FR-002** | **Field tanggal & waktu** — default tanggal = hari ini, waktu = jam server; datepicker men-disable tanggal tidak valid per aturan backdate unit; format `DD/MM/YYYY` & `HH:MM`. | US-002; BR-001–BR-004 |
| **FR-003** | **Dropdown tindakan** — searchable, terfilter **tipe penjamin + kelas + unit** (RJ/IGD: kelas "Tidak Ada"; RI: kelas sesuai penentuan modul RI — BR-065), menampilkan Nama · Layanan induk · Tipe penjamin · Kelas (**tanpa harga**). Pencarian per nama tindakan. | US-003; BR-005–BR-009, BR-065 |
| **FR-004** | **Field jumlah** — integer default 1, min 1; charge = tarif × jumlah; jumlah operator tidak dikalikan jumlah tindakan. | US-004; BR-010–BR-012 |
| **FR-005** | **Field Operator otomatis** — muncul per jasa medis; autofill default per unit pelayanan (matriks §12 Section C, BR-014); override manual dari Master Staf; boleh dikosongkan, kosong saat Tambah → user login (BR-016); tanpa blocking. | US-005; BR-013–BR-017 |
| **FR-006** | **Tambah ke list ringkasan** — item masuk dengan kolom No, Tanggal & Jam, Tindakan/BHP, Jumlah, Operator, Aksi (edit + hapus) — **tanpa kolom harga & tanpa tag perubahan**; field kiri di-reset (tanggal & waktu tetap). Tidak ada informasi harga di list. | US-006; BR-018–BR-024 |
| **FR-007** | **Edit / hapus item** (aksi hanya di list ringkasan) + re-validasi stok untuk Extra BHP. Item DB yang dihapus dikeluarkan dari list dan di-**soft delete** saat commit (BR-042). Status perubahan (tag Penambahan/Edit/Hapus) dihitung untuk ditampilkan di **modal konfirmasi**, bukan di list. | US-007; BR-025, BR-028 |
| **FR-008** | **Section Extra BHP** — checkbox mengaktifkan field BHP (searchable, hanya stok > 0, tampil "Nama — Stok Tersedia") & jumlah; **satu field Operator otomatis tampil** (label "Operator", tidak per jasa medis — BR-066); item masuk list dengan label "Extra". | US-008; BR-029, BR-030, BR-066 |
| **FR-009** | **Pengurangan stok & mutasi stok-out Extra BHP** — atomic dengan commit; catat mutasi lengkap; stok tidak boleh negatif. | US-009; BR-032–BR-034 |
| **FR-010** | **Validasi stok proaktif saat Tambah** — modal hard-block "Stock Tidak Mencukupi" (icon amber, judul, pesan nama lengkap + sisa stok, tombol OK); item tidak masuk list, field jumlah tetap. | US-010; BR-035–BR-037 |
| **FR-011** | **Modal Konfirmasi Pre-Save + validasi final + commit** — tabel delta perubahan dengan kolom **Perubahan** (tag) — **tanpa kolom harga, tanpa footer Total, tanpa icon edit/hapus per baris** — + [TUTUP]/[SIMPAN]; validasi final (list tidak kosong, tanggal valid, operator terisi, stok cukup dengan pessimistic lock); commit satu transaksi + publish event; rollback bila gagal. | US-011; BR-038, BR-039, BR-041, BR-042, BR-043 |
| **FR-012** | **Auto-sync order penunjang** — Lab (Fase 1): order ter-load otomatis saat konfirmasi, item terkunci, status order → "Selesai (Pencatatan)"; Radiologi (Fase 2 `[**]`) pola sama. | US-012; BR-044–BR-046 |
| **FR-013** | **Ownership & Cross-Module Read-Only View** — form load semua record kunjungan; item modul current editable, modul lain read-only + badge; commit hanya item modul current. | US-013; BR-048, BR-049, BR-051, BR-052 |
| **FR-014** | **Audit trail DB-only** — setiap commit ter-log ke `audit_log`; tanpa UI Fase 1; query per pasien/user. | US-014; BR-053 |
| **FR-015** | **Update dashboard pasien (icon checklist)** setelah commit; reset bila semua tindakan dihapus. | US-015; BR-054 |
| **FR-016** | **Integrasi billing** via event `tindakan_bhp_disimpan`; charge otomatis; retry + alert bila listener gagal. | US-016; BR-055 |
| **FR-017** | **Integrasi SISDI** config per tenant (RS PKU only); kirim tindakan ber-jasa medis dokter saat billing lunas; retry + alert. | US-017; BR-057 |
| **FR-018** | **Jurnal otomatis real-time** via event; config per tenant; event membawa data minimum untuk jurnal. | US-018 (detail jurnal → PRD Jurnal Otomatis) |
| **FR-019 `[**]`** | **Auto-populate paket BHP** dari master (section "BHP Paket Tindakan" kondisional, locked/read-only + notifikasi). | US-019; BR-059 |
| **FR-020 `[**]`** | **Pengurangan stok BHP paket** — atomic dengan Simpan; hard-block bila stok minus; audit membedakan paket vs extra. | US-020; BR-060 |
| **FR-021 `[**]`** | **Auto-populate paket layanan** — komponen masuk terpisah tag "Paket: [Nama]", tarif flat; hapus paket = hapus semua komponen; paket BHP rekursif per komponen. | US-021; BR-061 |
| **FR-022** | **BHP gas medis — jumlah otomatis** — saat BHP jenis gas medis dipilih di Extra BHP, tampil field Kecepatan gas (lpm), Durasi Pakai (menit), dan Operator; Jumlah terisi otomatis = Kecepatan gas × Durasi Pakai (satuan mengikuti BHP), read-only. Validasi stok memakai Jumlah hasil hitung. | US-022; BR-031, BR-063 |
| **FR-024** | **Validasi input dasar** — tindakan kosong ("Pilih tindakan terlebih dahulu"), jumlah < 1 ("Jumlah minimal 1"), list kosong → tombol Simpan disable. | US-004, US-010; BR-010, BR-035 |

## 11. User Stories

> Format "Sebagai … ingin … sehingga …", AC pola Given-When-Then. Level prioritas sumber: **P0** Critical/MVP · **P1** Must Have · **P2** Should Have · **P3** Low · **P4** Enhancement.
> **Pemetaan penomoran:** US-001…US-018 = Fase 1 (Fitur 1–18 sumber), US-019…US-021 = Fase 2 `[**]`. Referensi silang internal sumber ("Fitur N") dipertahankan apa adanya di dalam AC/aturan; lihat catatan inkonsistensi penomoran di Pertanyaan Terbuka.

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **dokter/perawat/petugas penunjang**, saya ingin membuka form Tindakan & BHP dari berbagai titik dalam workflow, sehingga saya tidak terputus dari aktivitas dan tidak perlu cari pasien manual. | 1) Given user di modul terkait, When klik shortcut/icon/entry penunjang, Then form terbuka sebagai overlay dengan header pasien terisi otomatis (No RM, Nama, Tgl Lahir+Umur, Jenis Penjamin) (BR-048). 2) Given entry point, When record baru dibuat, Then `source_module` ter-set benar. 3) Given order lab sudah dikonfirmasi, When form dibuka, Then item terkait tampil read-only (BR-045). | FR-001 |
| **US-002** | Sebagai **petugas**, saya ingin mencatat tanggal & waktu tindakan sesungguhnya dengan aturan backdate sesuai jenis layanan, agar tidak terjadi penyalahgunaan pencatatan mundur. | 1) Given RJ/IGD, When buka datepicker, Then tanggal sebelum hari ini di-disable (BR-001). 2) Given RI, When buka datepicker, Then tanggal sebelum admisi & sesudah hari ini di-disable (BR-001). 3) Given simpan, Then audit mencatat tanggal input vs timestamp server (BR-004). | FR-002 |
| **US-003** | Sebagai **dokter/perawat**, saya ingin daftar tindakan hanya yang sesuai tipe penjamin, kelas, & unit pelayanan (tanpa harga), supaya tidak salah pilih tindakan. | 1) Given pasien Umum, When buka daftar, Then tindakan khusus BPJS tidak muncul (BR-006). 2) Given RJ/IGD, Then filter kelas = "Tidak Ada" (BR-005). 3) Given pasien RI, Then daftar mengikuti penentuan kelas modul RI — Sesuai/Titip/Naik kelas (BR-005, BR-065). 4) Given daftar, Then hanya nama tindakan tanpa harga (BR-009). 5) Given dataset ≤ 5.000 tindakan, When ketik, Then pencarian responsif < 500ms (NFR-001). | FR-003 |
| **US-004** | Sebagai **petugas**, saya ingin mengisi jumlah tindakan, agar jumlah yang diberikan diketahui. | 1) Given field jumlah, When input non-integer/negatif, Then ditolak; default 1 (BR-010). 2) Given klik tambah tanpa pilih tindakan, Then pesan "Pilih tindakan terlebih dahulu" (FR-024). 3) Given commit, Then charge = tarif × jumlah, terverifikasi di tagihan (BR-012). | FR-004 |
| **US-005** | Sebagai **petugas**, saya ingin field Operator terisi otomatis sesuai unit pelayanan, agar cepat namun tetap bisa ganti/kosongkan operator manual bila dikerjakan orang lain. | 1) Given unit RJ, Then semua baris auto-fill nama dokter DPJP (tanpa filter role); bila DPJP tidak ada → kosong → user login saat Tambah (BR-014, BR-016). 2) Given unit IGD/Radiologi/Lab/Transfusi/Patologi/RI, Then semua baris auto-fill user login (BR-014). 3) Given unit IBS/VK, Then tidak ada autofill — field kosong (BR-014). 4) Given user hapus value / field kosong, When Tambah, Then diisi user login di ringkasan (BR-016). 5) Given user buka dropdown operator, Then tampil semua role/staf tanpa filter (BR-015); pilih manual → override; tanpa error "Operator wajib". | FR-005 |
| **US-006** | Sebagai **petugas**, saya ingin menambah tindakan ke list ringkasan sebelum simpan untuk mereview item yang akan dicatat, tanpa perlu melihat harga. | 1) Given field wajib terisi, When klik Tambah, Then item muncul < 100ms (NFR-003). 2) Then field kiri di-reset kecuali tanggal & waktu (BR-023). 3) Then list tidak menampilkan harga satuan/subtotal/total (BR-009, BR-019). | FR-006 |
| **US-007** | Sebagai **petugas**, saya ingin edit/hapus item di list dan melihat status perubahan tiap item sebelum simpan, supaya bisa koreksi tanpa mulai ulang. | 1) Given klik pensil item DB, When Update, Then perubahan tercatat sebagai Edit (tampil di modal) (BR-025). 2) Given hapus item belum tersimpan, Then langsung hilang; item DB → dikeluarkan dari list dan di-soft delete saat commit (BR-042). 3) Then tag perubahan (Penambahan/Edit/Hapus) muncul di modal konfirmasi, bukan di list (BR-025). 4) Then tidak ada efek ke stok/billing sebelum commit (BR-028). | FR-007 |
| **US-008** | Sebagai **petugas**, saya ingin menambahkan BHP tambahan di luar paket standar, supaya billing & stok terupdate sesuai pemakaian sesungguhnya. | 1) Given checkbox Extra BHP dicentang, Then field BHP & jumlah aktif (BR-029). 2) Then daftar hanya BHP stok > 0 per unit pelayanan (BR-029). 3) Then satu field Operator tampil otomatis (label "Operator", tidak per jasa medis), autofill mengikuti matriks per unit (BR-066). 4) When klik Tambah, Then validasi stok dijalankan (FR-010). 5) Then pencarian responsif < 500ms (NFR-002). | FR-008 |
| **US-009** | Sebagai **apoteker**, saya ingin stok BHP berkurang otomatis sesuai pemakaian, supaya stok sistem selalu sinkron dengan stok fisik. | 1) Given Simpan lolos validasi, Then stok berkurang per Extra BHP + mutasi stok-out tercatat (BR-034). 2) Then pengurangan atomic dengan simpan tindakan & charge (BR-032). 3) Given 2 user simpan BHP terakhir, Then satu sukses, satu rollback dengan pesan jelas (R1). | FR-009 |
| **US-010** | Sebagai **petugas**, saya ingin tahu lebih awal bila stok BHP tidak cukup, supaya bisa langsung sesuaikan jumlah/koordinasi farmasi sebelum gagal disimpan. | 1) Given qty > stok tersedia, When klik Tambah, Then modal "Stock Tidak Mencukupi" (nama lengkap + sisa stok + OK), item tidak masuk list (BR-035, BR-037). 2) Then field jumlah tetap di angka terakhir. 3) Then validasi memperhitungkan qty BHP sama yang sudah di list (BR-036). | FR-010 |
| **US-011** | Sebagai **petugas**, saya ingin sistem menampilkan ringkasan perubahan untuk review sekali lagi sebelum commit, lalu menyimpan semua dalam satu transaksi, sehingga billing/stok/jurnal konsisten dan saya punya kesempatan koreksi terakhir. | 1) Given list kosong, When klik Simpan, Then tombol disable / pesan "Tambahkan minimal 1 tindakan atau BHP" (FR-024). 2) Given list ≥ 1, When klik Simpan, Then modal tampil (judul, tabel delta + kolom Perubahan/tag, tanpa harga, tanpa footer Total, **tanpa icon edit/hapus**, TUTUP/SIMPAN) (BR-038). 3) When klik SIMPAN, Then UI lock < 200ms + commit (NFR-011). 4) Given validasi gagal, Then tidak ada partial save (BR-039). 5) Given sukses, Then muncul di billing & stok ter-update < 5 detik (NFR-006). 6) Given race stok, Then modal "Stock Tidak Mencukupi" (BR-033). | FR-011 |
| **US-012** | Sebagai **petugas lab**, saya ingin tindakan pemeriksaan yang sudah diorder dari Pelayanan otomatis ter-load saat saya konfirmasi order, supaya tidak perlu mengetik ulang. | 1) Given order lab dikonfirmasi, Then semua pemeriksaan ter-load sebagai item terpisah (jumlah 1, tarif per penjamin, operator = user login) (BR-046). 2) Then item auto-fill terkunci (BR-045). 3) When commit, Then status order → "Selesai (Pencatatan)" (dikelola modul Lab). 4) Then Fase 1 hanya Lab (Radiologi/Patologi/Transfusi manual) (BR-044). | FR-012 |
| **US-013** | Sebagai **petugas di modul manapun**, saya ingin melihat semua tindakan & BHP kunjungan (termasuk modul lain) tapi hanya bisa edit/hapus record modul saya, supaya punya konteks lengkap tanpa salah modifikasi catatan unit lain. | 1) Given form dibuka, Then semua record kunjungan ter-load terlepas `source_module` (BR-049). 2) Then item modul current editable; modul lain read-only + badge "Dari Modul [Nama]" (BR-049). 3) Then item read-only tampil sebagai konteks tanpa informasi harga (BR-024). 4) When Simpan, Then commit hanya item modul current. | FR-013 |
| **US-014** | Sebagai **admin sistem & auditor internal**, saya ingin setiap action di form ter-log di database, supaya investigasi & audit bisa dilakukan tanpa mengandalkan ingatan user. | 1) Given commit, Then record `audit_log` (timestamp, user, action_type, entity_ref, before/after, IP/UA) (BR-053). 2) Then tidak ada UI Fase 1. 3) Then query audit per pasien/user < 2 detik untuk 1 tahun data (NFR-008). | FR-014 |
| **US-015** | Sebagai **dokter di sesi berikutnya**, saya ingin tahu sekilas dari dashboard bahwa tindakan & BHP sudah tercatat, supaya alur kerja jelas. | 1) Given commit sukses, Then icon Tindakan jadi checklist < 2 detik (NFR-007). 2) Then indikator hanya minimal 1 tindakan (bukan jumlah/detail) (BR-054). 3) Given semua tindakan dihapus, Then icon reset. | FR-015 |
| **US-016** | Sebagai **kasir**, saya ingin charge tindakan & BHP otomatis muncul di tagihan tanpa input manual, supaya tagihan mencerminkan layanan yang diberikan. | 1) Given Simpan sukses, Then charge muncul di billing < 5 detik (NFR-006). 2) Given listener terganggu, Then event di-queue & retry; user tidak terhambat. 3) Given retry max gagal, Then alert admin. | FR-016 |
| **US-017** | Sebagai **manajemen RS PKU**, saya ingin data tindakan ber-jasa medis dokter terkirim otomatis ke SISDI saat billing lunas, supaya remunerasi akurat tanpa input manual. | 1) Given tenant RS PKU (`integrasi_sisdi_aktif=true`), When billing lunas, Then worker SISDI ter-trigger; tenant lain tidak (BR-057). 2) Then hanya tindakan ber-jasa medis dokter dikirim. 3) Then data terkirim < 30 detik (NFR-009). 4) Given gagal, Then retry + alert. | FR-017 |
| **US-018** | Sebagai **akuntan**, saya ingin jurnal terbentuk saat tindakan & BHP disimpan, supaya tidak ada lag antara kejadian operasional dan pencatatan keuangan. | 1) Given `jurnal_otomatis_aktif` toggle on, When tindakan tersimpan, Then jurnal terbentuk < 10 detik (NFR-010). 2) Then event membawa data minimum jurnal (detail → PRD Jurnal Otomatis). 3) Given gagal, Then retry + alert tanpa menghambat user. | FR-018 |
| **US-019 `[**]`** | Sebagai **dokter/perawat**, saya ingin BHP standar tindakan terisi otomatis, sehingga tidak perlu input manual dan billing pasti mencakup BHP standarnya. | 1) Given tindakan punya paket BHP, Then section "BHP Paket Tindakan" muncul (locked) + notifikasi (BR-059). 2) Then BHP paket tidak bisa edit/hapus dari UI. 3) When Simpan, Then stok paket berkurang (FR-020). | FR-019 |
| **US-020 `[**]`** | Sebagai **apoteker**, saya ingin stok BHP paket berkurang saat tindakan tersimpan, supaya stok sinkron untuk semua BHP terpakai (paket + extra). | 1) Given Simpan, Then stok BHP paket berkurang, atomic (BR-060). 2) Then audit membedakan paket vs extra. 3) Given stok paket kurang, Then hard-block Simpan (lengkapi stok / pindah ke Extra BHP). | FR-020 |
| **US-021 `[**]`** | Sebagai **dokter**, saya ingin satu paket layanan dipilih sebagai satu item dan sistem otomatis pecah jadi komponen. | 1) Given pilih paket layanan, Then semua komponen masuk list tag "Paket" (BR-061). 2) Then operator muncul per komponen sesuai jasa medis. 3) Then charge = tarif paket flat; hapus paket = hapus semua komponen. | FR-021 |
| **US-022** | Sebagai **petugas**, saya ingin jumlah BHP gas medis dihitung otomatis dari Kecepatan gas × Durasi Pakai, agar pencatatan pemakaian gas cepat & akurat tanpa hitung manual. | 1) Given BHP gas medis dipilih, Then tampil field Kecepatan gas (lpm), Durasi Pakai (menit), dan satu field Operator (autofill per matriks unit — BR-063, BR-066). 2) Given Kecepatan gas & Durasi diisi, Then Jumlah terisi otomatis = Kecepatan gas × Durasi Pakai, satuan ikut BHP, read-only (BR-031). 3) When Tambah, Then validasi stok memakai Jumlah hasil hitung (FR-010); item + Operator (kosong → user login) masuk list ringkasan (BR-016). | FR-022 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi & penjamin **reuse definisi kanonik dari modul Pendaftaran / Data Sosial Pasien** — nama, tipe, format, validasi harus sama.

### A. Header Form — Identitas Pasien (read-only, FR-001)
| Kolom | Sumber Data | Format Tampilan | Catatan |
|-------|-------------|-----------------|---------|
| No RM | Pendaftaran pasien | text | Kanonik. |
| Nama Pasien | Data sosial pasien — Nama | text | Kanonik. |
| Tanggal Lahir + Umur | Data sosial pasien | date + umur terhitung | Kanonik. |
| Tipe Penjamin | Data sosial pasien — Tipe Penjamin | text/badge | Dasar filter tindakan. |
| Unit Pelayanan | Data sosial pasien — Klinik | text | Dasar filter + aturan backdate. |
| Bangsal (RI) | Pendaftaran pasien RI — pemilihan bangsal/kelas | text | Proxy kelas perawatan; hanya RI. |

### B. Layar INPUT — Section Tindakan (FR-002, FR-003, FR-004)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| tanggal | Tanggal | date (datepicker) | Ya | `DD/MM/YYYY`; aturan backdate FR-002 | Default: hari ini | Editable. |
| waktu | Waktu | time (timepicker) | Ya | `HH:MM` (24 jam) | Default: jam server | Editable. |
| tindakan | Tindakan | dropdown (searchable, single select) | Ya | Filter tipe penjamin + kelas + unit (RJ/IGD: kelas "Tidak Ada"; RI: kelas via modul RI — BR-005, BR-065) | Master Tindakan (per tipe penjamin & kelas) | Tampil: Nama, Layanan induk, Tipe penjamin, Kelas (tanpa harga). Editable. |
| jumlah | Jumlah | integer | Ya | Min 1; tanpa desimal/negatif | Default: 0 | Editable. |

### C. Layar INPUT — Section Operator (FR-005)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| profesi | Profesi | text | — | — | Jasa medis di master tindakan (mis. "Dokter Umum") | Read-only. |
| nama_operator | Nama | dropdown (single select) | Tidak (boleh kosong) | Menampilkan semua role/staf (tanpa filter role di Fase 1) | Autofill default per unit pelayanan (lihat matriks di bawah); kosong saat Tambah → user login (BR-016) | Editable; sumber Master Data Staf. `[**]` filter per role = Fase 2. |

**Matriks autofill default operator (section Tindakan) per unit pelayanan — BR-014:**

| Unit Pelayanan | Autofill default operator (semua baris jasa medis) |
|----------------|-----------------------------------------------------|
| Rawat Jalan (RJ) | Nama dokter DPJP (DPJP utama kunjungan) ke semua baris (tanpa filter role di Fase 1); bila DPJP tidak tersedia → kosong → user login saat Tambah |
| IGD | User login untuk semua baris |
| IBS (Bedah Sentral) | Tanpa autofill — field dibiarkan kosong |
| VK (Kamar Bersalin) | Tanpa autofill — field dibiarkan kosong |
| Radiologi | User login untuk semua baris |
| Laboratorium | User login untuk semua baris |
| Transfusi Darah | User login untuk semua baris |
| Patologi Anatomi | User login untuk semua baris |
| Rawat Inap (RI) | User login untuk semua baris |

> Berlaku untuk semua baris Operator (per jasa medis). Dropdown pilihan operator menampilkan **semua role/staf tanpa filter di Fase 1** (BR-015); selalu bisa di-override manual atau dikosongkan; bila kosong saat Tambah → diisi user login (BR-016). **Section Extra BHP**: hanya **satu** field Operator (label "Operator", tidak per jasa medis; BR-066) yang autofill-nya mengikuti matriks yang sama di atas. `[**]` filter/penyesuaian per role = Fase 2.

### D. Layar INPUT — Section Extra BHP (FR-008)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| chk_extra_bhp | Checkbox Extra BHP | boolean | Tidak | Toggle aktif/nonaktif field BHP & jumlah | Default: tidak aktif | Opsional. |
| nama_bhp | Nama Alkes/BHP | dropdown (searchable, single select) | Ya (bila toggle aktif) | Hanya stok > 0 per unit pelayanan | Master farmasi terfilter stok | Tampil "Nama — Stok Tersedia". Editable. |
| jumlah_bhp | Jumlah | integer/decimal | Ya (bila toggle aktif) | Min 1; tanpa negatif | Default: 0 | Editable untuk BHP biasa. **BHP gas medis**: read-only, terisi otomatis = Kecepatan gas × Durasi Pakai (BR-031); satuan mengikuti BHP. |
| kecepatan_gas | Kecepatan gas | decimal | Ya (bila BHP gas medis) | > 0; satuan **lpm** | Input user | Tampil **hanya** bila BHP jenis gas medis (BR-063). |
| durasi_pakai | Durasi Pakai | integer | Ya (bila BHP gas medis) | > 0; satuan **menit** | Input user | Tampil **hanya** bila BHP jenis gas medis (BR-063). |
| operator_bhp | Operator | dropdown (single select) | Tidak (boleh kosong) | Menampilkan semua staf (tanpa filter role di Fase 1) | Autofill per matriks unit (BR-014); kosong saat Tambah → user login (BR-016) | Section Extra BHP: **satu** field Operator (label "Operator", otomatis tampil, tidak per jasa medis — BR-066). Tercatat di kolom Operator list ringkasan. |

### E. Layar TAMPIL — List Ringkasan "Tindakan & BHP yang Digunakan" (FR-006)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No | Auto-generated | angka urut | urut tambah | — |
| Tanggal & Waktu | Input Section Tindakan/Extra BHP | `DD/MM/YYYY HH:MM` | — | — |
| Tindakan atau BHP | Nama tindakan/BHP | text | — | `[**]` beri tag "Paket"/"Extra". |
| Jumlah | Input user | angka | — | — |
| Operator | Tindakan: autofill per unit (BR-014); Extra BHP: 1 operator "Operator", autofill per unit (BR-066) | bullet list per jasa medis (tindakan) / 1 operator (BHP) | — | Kosong saat Tambah → user login (BR-016). |
| Aksi | — | icon edit + hapus | — | Hanya di list ringkasan. Item dihapus dikeluarkan dari list (soft delete saat commit). Item read-only modul lain: kosong / icon lock. |

> Kolom **Keterangan/tag perubahan dihilangkan** dari list — tag Penambahan/Edit/Hapus hanya tampil di modal konfirmasi (BR-025).

> Kolom harga (Harga Satuan, Sub Total) dan footer Total **dihilangkan** dari list — tidak ada informasi harga di form (BR-009).

### F. Layar TAMPIL — Modal Konfirmasi Pre-Save (FR-011)
| Kolom / Elemen | Sumber Data | Format Tampilan | Catatan |
|----------------|-------------|-----------------|---------|
| Judul modal | statis | text | "Apakah anda yakin ingin menyimpan data ini?" |
| Section header | statis | text | "PERUBAHAN TINDAKAN DAN BHP YANG DIGUNAKAN". |
| Tabel kolom | delta perubahan (dihitung dari state form) | tabel | No · Nama Tindakan atau BHP · Jumlah · Nama Operator · Perubahan. Tanpa kolom harga, **tanpa Aksi**. |
| Tag perubahan per row | dihitung dari state form | badge | Penambahan/Edit/Hapus (**hanya di modal**). |
| Tombol footer | statis | button | [TUTUP] (kiri, abu-abu) · [SIMPAN] (kanan, biru primary). Tidak ada icon edit/hapus per baris. |

### G. Data TER-GENERATE saat Simpan — Audit Trail (DB-Only, Fase 1, FR-014)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| timestamp_save | Waktu simpan | datetime | Server time saat save | Dibuat otomatis oleh sistem. |
| user_id | User ID | ref | Staf pencatat (session/JWT) | BR-052. |
| user_name | Nama user | text | Staf pencatat | — |
| action_type | Jenis aksi | enum | CREATE_TINDAKAN / EDIT_TINDAKAN / DELETE_TINDAKAN / CREATE_BHP / EDIT_BHP / DELETE_BHP | BR-053. |
| entity_id | ID entitas | ref | ID tindakan / BHP | — |
| pasien_id | Ref pasien | ref | Pasien & kunjungan | — |
| before_value | Nilai sebelum | JSON | Snapshot before (EDIT/DELETE) | — |
| after_value | Nilai sesudah | JSON | Snapshot after (EDIT/DELETE) | — |

### H. Validasi (ringkasan)
| Fitur | Kondisi | Message / Perilaku |
|-------|---------|--------------------|
| Tindakan kosong | Klik Tambah tanpa pilih tindakan | Message pada field "Tindakan": "Pilih tindakan terlebih dahulu". |
| Jumlah < 1 | Input 0/negatif | Message pada field "Jumlah": "Jumlah minimal 1". |
| Extra BHP stok kurang (tambah ke list) | Qty > stok | Modal "Stok tidak mencukupi" + "[Nama BHP lengkap] tidak mencukupi, sisa stok X [satuan]" + [OK] → item tidak masuk list. |
| Extra BHP stok kurang (saat simpan) | Stok berkurang di DB karena user lain | Modal "Stok tidak mencukupi" + pesan + [OK]. |
| List kosong | Belum ada item di list | Tombol Simpan disable. |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Pencarian tindakan responsif < 500ms untuk dataset hingga 5.000 tindakan. | FR-003 |
| **NFR-002** | Performa | Pencarian BHP responsif < 500ms. | FR-008 |
| **NFR-003** | Responsivitas | Item baru muncul di list < 100ms. | FR-006 |
| **NFR-004** | Performa | Sistem menampilkan form/asesmen < 1 detik. | Goal user |
| **NFR-005** | Performa | Sistem menyimpan/mengupdate < 1 detik. | Goal user · [PERLU KONFIRMASI vs target billing/jurnal] |
| **NFR-006** | Real-Time | Charge muncul di billing < 5 detik setelah Simpan. | FR-016; Metrik |
| **NFR-007** | Responsivitas | Icon dashboard berubah < 2 detik setelah Simpan. | FR-015 |
| **NFR-008** | Performa | Query audit per pasien/user < 2 detik untuk 1 tahun data. | FR-014 |
| **NFR-009** | Real-Time | Data SISDI terkirim < 30 detik setelah billing lunas (target awal, sesuai kapasitas SISDI). | FR-017; Metrik |
| **NFR-010** | Real-Time | Jurnal terbentuk < 10 detik setelah tindakan tersimpan. | FR-018 |
| **NFR-011** | Responsivitas | Klik [SIMPAN] → UI lock < 200ms + loading indicator. | FR-011 |
| **NFR-012** | Reliabilitas | Race condition stok di-handle dengan pessimistic lock (`SELECT … FOR UPDATE`); satu transaksi sukses, satu rollback dengan pesan jelas. | R1 |
| **NFR-013** | Keamanan/RBAC | Identitas operator (user login) diambil dari session/JWT, bukan input form. Ownership `source_module` membatasi edit/hapus lintas modul. | FR-005; FR-013 |
| **NFR-014** | Auditabilitas | Semua action commit ter-log ke `audit_log`; retention default ≥ 5 tahun (data medis). | FR-014 |
| **NFR-015** | Reliabilitas | Commit atomic (all-or-nothing); tidak boleh partial save. | FR-011 |
| **NFR-016** | Konfigurabilitas | Flag per tenant: `integrasi_sisdi_aktif`, `jurnal_otomatis_aktif`. (`tampilkan_tarif_di_form_tindakan` di-retire — harga tidak ditampilkan di form untuk semua tenant.) | FR-017; FR-018 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **SISDI (RS PKU)** | Kirim data tindakan ber-jasa medis dokter saat billing lunas (kontrak interface v1). | Live — config per client (RS PKU only) | FR-017 |
| **Billing** | Posting charge tindakan + BHP ke tagihan pasien. | Internal (event bus) | FR-016 |
| **Stok / Inventory** | Validasi stok real-time + mutasi stok-out per unit pelayanan. | Internal | FR-009, FR-010 |
| **Jurnal Otomatis** | Konsumen event `tindakan_bhp_disimpan` untuk generate jurnal. | Internal — config per tenant | FR-018 |
| **Order Penunjang (Lab/Radiologi)** | Event source auto-sync order → form. | Internal | FR-012 |
| **Master Data Tindakan / Staf / BHP** | Sumber daftar tindakan (per penjamin), operator, BHP. | Internal (dependency) | FR-003, FR-005, FR-008 |
| **Event bus** | Publish `tindakan_bhp_disimpan` / `_diubah` / `_dihapus`. | Internal | FR-011 |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Master Data Tindakan | Hard | Filter per penjamin & struktur master tidak tersedia → tarif/filter tidak jalan. |
| PRD Stok | Hard | Validasi & mutasi stok tidak jalan → commit gagal. |
| PRD Billing | Hard | Charge tidak ter-posting → tagihan tidak lengkap. |
| PRD Order Penunjang | Hard (untuk auto-sync Lab) | Auto-sync Lab tidak berfungsi. |
| PRD Jurnal Otomatis | Soft | Bisa dinonaktifkan per tenant; jurnal tertunda. |
| PRD Integrasi SISDI | Soft | RS PKU only; tenant lain tidak terpengaruh. |
| BPMN E1 Input Tindakan & BHP | Hard (referensi alur) | Alur commit/event acuan utama. |

## 15. Roadmap

| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | Entry point 11 titik, input tindakan + Extra BHP, filter penjamin & tarif, operator cascade, list ringkasan + edit/hapus, validasi stok, modal konfirmasi & commit satu transaksi, auto-sync order Lab, ownership cross-module read-only, audit trail DB-only, integrasi billing, SISDI (RS PKU), jurnal otomatis, update dashboard pasien. (FR-001–FR-018, FR-024) |
| **Fase 2** `[**]` | Auto-populate paket BHP (locked), auto-populate paket layanan, validasi stok seluruh BHP (paket + extra), auto-sync order Radiologi, penyesuaian operator per role (autofill & filter dropdown). (FR-019–FR-021) |
| **Fase 3** `[***]` | Evaluasi auto-sync order ke Modul Patologi Anatomi. |
| **Fase 4** `[****]` | Enhancement/inovasi masa depan (legend). [PERLU KONFIRMASI cakupan] · Auto-sync Transfusi Darah = roadmap evaluasi. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|----|--------|----------|
| **R1** | **Race condition stok BHP** — 2 user simpan bersamaan dengan BHP yang stoknya menipis (mis. stok 7, dua user @qty 5). User B gagal menambahkan BHP. | Saat Simpan, pessimistic check ambil stok terkini `SELECT … FOR UPDATE` (row-level lock) sebelum decrement. Bila stok < qty → rollback transaksi user B + modal "Stock Tidak Mencukupi (stok berubah karena user lain)". Validasi proaktif saat Tambah (FR-010) mengurangi probabilitas, tapi pessimistic check di commit time adalah pengaman utama. |
| **R2** | Listener billing / jurnal / SISDI gagal saat publish event. | Event di-queue & retry (exponential backoff, max 3x); setelah max retry → alert admin. Tindakan tetap tersimpan; user tidak terhambat. |
| **R3** `[**]` | Stok paket BHP minus saat commit. | Hard-block Simpan; user harus lengkapi stok via modul Stok atau pindahkan BHP ke Extra BHP untuk adjust manual. |
| **R4** | Salah tarif akibat jenis penjamin tidak sesuai. | Penyaringan tindakan otomatis per penjamin + cross-check tarif dengan master (BR-005–BR-008). |


## 19. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 08 Juni 2026 | Team Product (PIC: Elfira) | Draft awal Tindakan & BHP. |
| 1.0-gen | (konversi) | Team Product | Konversi ke format generator MD Neurovi v2 (dekomposisi ke BR/US/FR/NFR, penambahan flag [PERLU KONFIRMASI]). |
| 1.1-gen | 01 Juli 2026 | Team Product (PIC: Elfira) | Spesifikasi lengkap BHP gas medis dari mockup HAFSHAH 4: field Kecepatan gas (lpm), Durasi Pakai (menit), Jumlah otomatis (= kecepatan × durasi), dan Operator; tambah BR-063 (deteksi & field kondisional) & BR-064 (validasi input + operator). Flag [PERLU KONFIRMASI] gas medis dipersempit ke penandaan jenis di master, pembulatan, dan override manual. |
| 1.2-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **Filter dropdown tindakan**: RJ/IGD = tipe penjamin + kelas "Tidak Ada" + unit; RI = tipe penjamin + kelas + unit dengan case Sesuai/Titip/Naik kelas di-handle di modul RI (BR-005, BR-065 baru; FR-003, US-003 disesuaikan). **Autofill operator (Tindakan)** kini per unit pelayanan — matriks di §12 Section C (RJ DPJP→user login; IGD/Radiologi/Lab/Transfusi/Patologi/RI user login; IBS/VK tanpa autofill) (BR-014 ditulis ulang). **Operator boleh dikosongkan; kosong saat Tambah → user login** untuk section Tindakan & Extra BHP (BR-016 ditulis ulang). **Operator section Extra BHP** = satu field, default user login (BR-064, data field operator_bhp disesuaikan). |
| 1.3-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | Koreksi operator Fase 1 MVP: (1) autofill RJ = nama dokter DPJP ke **semua baris** role (tidak lagi cocokkan per role); (2) dropdown pilihan operator menampilkan **semua role tanpa filter** (Tindakan & Extra BHP). Penyesuaian autofill & pilihan operator per role dipindah ke **enhancement Fase 2** (`[**]`; Scope Fase 2 & Roadmap ditambah). BR-014, BR-015 disesuaikan; matriks Section C & US-005 diperbarui. |
| 1.4-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **BHP gas medis diklasifikasikan sebagai kondisi as-is v1** (bukan fitur baru v2): ditambahkan ke Kondisi Saat Ini §2; In Scope #17 & BR-063 diberi keterangan "mengikuti v1"; flag gas medis di Pertanyaan Terbuka diubah dari [PERLU KONFIRMASI] menjadi [VERIFIKASI v1]. |
| 1.5-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **Informasi harga dihilangkan dari seluruh tampilan form**: dropdown tindakan (tanpa Rp tarif), list ringkasan (hapus kolom Harga Satuan, Sub Total, footer Total), dan modal konfirmasi (hapus kolom harga & footer Total) untuk semua tenant. Tarif tetap diproses backend (charge billing, jurnal). Flag `tampilkan_tarif_di_form_tindakan` di-retire untuk tampilan. Disesuaikan: In Scope #4/#6/#11, perbandingan As-Is/To-Be, Skenario, BR-009/019/020/021/022/023/024/026/040/050, State Machine, FR-003/006/011, US-003/006/011, Data Requirements B/E/F, NFR-003/016, Asumsi. |
| 1.6-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **Operator di section Extra BHP** dieksplisitkan: otomatis tampil sebagai **satu** field berlabel "Operator" (tidak per jasa medis seperti Tindakan); autofill mengikuti matriks per unit (BR-014) — menyempurnakan default "user login" sebelumnya. Tambah BR-066; disesuaikan FR-008, US-008, US-022, BR-064, operator_bhp, catatan matriks & kolom ringkasan; pertanyaan terbuka scope operator Extra BHP di-resolve. |
| 1.7-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **Tag perubahan (Penambahan/Edit/Hapus) dipindah dari list ringkasan ke modal konfirmasi** (kolom Perubahan) — mengikuti mockup Klinik Anak. List ringkasan: hapus kolom Keterangan/tag; item ditandai hapus tampil strikethrough + icon restore. **Modal konfirmasi**: hilangkan icon edit/hapus per baris — edit/hapus hanya di list. Disesuaikan: In Scope #6, State Machine §9, BR-025/026/027/040, FR-006/007/011, US-007/011, Data Requirements E/F, Skenario 4. |
| 1.8-gen | 02 Juli 2026 | Team Product (PIC: Elfira) | **Hapus BR-026, BR-027, BR-040, BR-047, BR-050, BR-056, BR-058, BR-062, BR-064** dari tabel Business Rules. **Fitur multitagging di-drop** sepenuhnya (BR-062 + FR-023 + US-023 + In Scope #18 + referensi Asumsi/Pertanyaan Terbuka dihapus). **BR-042**: Hapus = **soft delete** (bukan hard delete). Perilaku strikethrough/restore in-list (dari BR-026/027) dihilangkan — item dihapus dikeluarkan dari list, soft delete saat commit, tag Hapus tampil di modal. Sitiran BR yang dihapus dibersihkan di FR-007/011/012/013/016/018/022, US-007/011/012/013/016/018/022, State Machine §9, Section E/F, Skenario 4, VERIFIKASI v1. FR inti (FR-007/011/012/013/016/018/022) dipertahankan sebagai fitur — detail BR yang dihapus dianggap milik PRD terkait; hanya FR-023 (multitagging) yang dihapus. |
