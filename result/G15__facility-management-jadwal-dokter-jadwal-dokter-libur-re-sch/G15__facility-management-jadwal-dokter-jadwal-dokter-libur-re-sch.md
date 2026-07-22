# PRD — Facility Management: Jadwal Dokter (Input Jadwal, Libur & Re-schedule)

**Related Document:** List Fitur V2.xlsx (sheet MVP Fitur Operasional); BPMN terkait: g-admisi-inpatient-registration, g-service-internal-consult, g-service-internal-referral, g-service-cpo-order; Fitur terkait G16 (Ubah Kuota), G17 (Pengaturan Antrian)
**Versi:** 1.2 - Tambah panel listing jadwal existing + penjelasan Reguler vs Tambahan vs Pola Berulang
**Tanggal:** 2026-06-19

## 1. Overview / Brief Summary

Modul **Jadwal Dokter (Input Jadwal, Libur & Re-schedule)** (kode **G15**, cluster *Core Integration > Facility Management*) mengelola **siklus penuh jadwal praktik dokter**: (a) **pembuatan/input jadwal praktik reguler** dokter per poli/unit (hari, sesi, jam, kuota, ruangan), dan (b) **pengelolaan pengecualian** jadwal tersebut: **cuti/libur**, **perubahan jadwal sementara (re-schedule)**, **dokter pengganti**, dan **pembatalan praktik**.

Jadwal yang diinput menjadi **template/master ketersediaan dokter** — sumber slot yang dikonsumsi proses pendaftaran (loket/APM/online), antrian (G17), dan kuota (G16). Pengecualian (libur/reschedule/batal) bekerja **di atas** jadwal master ini: memblokir/mengubah slot turunan tanpa menghapus templatenya.

Fokus PRD: **siklus jadwal dari pembuatan hingga pengecualian**. Sasaran inti — (1) petugas dapat mendefinisikan jadwal praktik dokter sebagai sumber slot terpusat; (2) ketika dokter libur/jadwal berubah, sistem otomatis memblokir slot terdampak agar tidak dapat dibooking, menandai/menjadwalkan ulang pasien terdaftar, dan memicu notifikasi.

**Catatan istilah (penting, sering tertukar):**
- **Tipe jadwal** = makna bisnis jadwal: **Reguler** (praktik rutin/tetap) vs **Tambahan/Insidental** (sesi ekstra sekali waktu).
- **Pola berulang** = *mekanisme input/generate slot*, BUKAN tipe jadwal: apakah jadwal di-generate otomatis per hari mingguan (`pola_berulang = true`) atau hanya pada tanggal spesifik (`pola_berulang = false`).

Penjelasan lengkap perbedaan ketiga konsep ada di **Section 3 — Konsep Jadwal**.

Dirancang realistis untuk **RS Tipe C & D**: SDM IT terbatas, internet kadang tidak stabil — alur tetap dapat dijalankan manual oleh petugas bila integrasi notifikasi gagal.

## 2. Background

**Kondisi saat ini (As-Is) [ASUMSI — diturunkan dari pola RS Tipe C&D, belum ada BPMN khusus G15]:**
- **Jadwal praktik dokter** sering hanya tersimpan di papan/Excel/cetakan poli, tidak menjadi sumber slot di sistem pendaftaran → slot dibuat manual atau tidak konsisten antar kanal.
- Perubahan jadwal dokter (cuti mendadak, ganti dokter) dicatat manual (papan tulis, grup WhatsApp, telepon antar petugas).
- Pasien yang sudah terdaftar/booking pada hari dokter libur baru tahu saat datang ke RS → komplain, antrian menumpuk, kepercayaan turun.
- Loket, APM, dan kanal online tidak sinkron: slot dokter yang libur masih bisa dipilih pasien.
- Saat membuat jadwal baru, petugas tidak punya **acuan jadwal existing dokter** → sering terjadi tumpang tindih jam/ruang yang baru ketahuan belakangan.
- Tidak ada jejak audit siapa membuat/mengubah jadwal dan kapan.

**Kenapa modul ini perlu:**
- Menyediakan **tempat input jadwal praktik** sebagai **satu sumber kebenaran** ketersediaan dokter yang dikonsumsi semua kanal pendaftaran & antrian.
- Menyediakan **panel listing jadwal existing** sebagai acuan saat input baru → cegah bentrok lebih dini.
- Mengotomasi penanganan pasien terdampak (re-schedule/notifikasi) sehingga mengurangi komplain dan beban petugas pendaftaran.
- Mendukung audit & akuntabilitas pembuatan dan perubahan jadwal.

*Catatan: modul ini BELUM memiliki BPMN sendiri. Alur As-Is/To-Be diturunkan secara analogi dari proses pendaftaran rawat inap (reschedule jadwal), validasi jadwal/kuota pada konsul/rujuk internal, dan pola antrian — ditandai [ASUMSI].*

## 3. In Scope

### Scope Definition (dikerjakan)
1. **Input/pembuatan jadwal praktik reguler dokter** — definisikan jadwal per dokter & poli/unit: hari/pola berulang, sesi, jam mulai–selesai, kuota (ref G16), ruangan, periode berlaku. CRUD jadwal (tambah/ubah/nonaktifkan).
2. **Jadwal tambahan/insidental** (sesi ekstra di luar pola reguler).
3. **Panel listing jadwal existing** — saat akan membuat jadwal baru, tampilkan daftar jadwal dokter/poli yang sudah ada sebagai acuan & pencegah bentrok.
4. **Pengajuan & pencatatan libur/cuti dokter** (tanggal mulai–selesai, alasan, status pengganti).
5. **Re-schedule jadwal praktik** — pindah hari/jam/poli untuk rentang tanggal tertentu, atau penambahan sesi pengganti.
6. **Penunjukan dokter pengganti** pada slot yang ditinggalkan.
7. **Pembatalan praktik** (cancel sesi) tanpa pengganti.
8. **Pemblokiran slot otomatis** pada hari terdampak agar tidak dapat dibooking di semua kanal (loket/APM/online).
9. **Deteksi & penanganan pasien terdampak** yang sudah terdaftar/booking: daftar pasien terdampak + aksi re-schedule manual/otomatis + notifikasi.
10. **Workflow persetujuan** input/perubahan jadwal (pengaju → approver) [ASUMSI, dapat dimatikan untuk RS kecil].
11. **Notifikasi** ke pasien & petugas terkait perubahan (via modul notifikasi/antrian).
12. **Audit log** semua aksi jadwal — input/ubah/hapus/libur/reschedule/batal/approve (siapa, kapan, aksi apa).
13. **Dashboard/kalender** jadwal praktik, status libur & perubahan dokter.

### Konsep Jadwal — Reguler vs Tambahan vs Pola Berulang **[BARU — penjelasan diminta user]**

Tiga istilah ini sering tertukar. **Tipe jadwal** = makna bisnis (kenapa jadwal ada). **Pola berulang** = mekanisme teknis (bagaimana slot di-generate). Keduanya **dimensi berbeda dan saling independen**.

| Aspek | **Reguler** | **Tambahan / Insidental** | **Pola Berulang** (atribut input) |
|-------|-------------|----------------------------|------------------------------------|
| Kategori | Tipe jadwal (`tipe_jadwal`) | Tipe jadwal (`tipe_jadwal`) | Cara generate slot (`pola_berulang`) — BUKAN tipe |
| Arti | Praktik rutin/tetap dokter | Sesi ekstra di luar rutinitas | Apakah jadwal diulang otomatis tiap minggu vs hanya tanggal tertentu |
| Frekuensi | Berkelanjutan selama periode berlaku | Umumnya sekali / beberapa tanggal spesifik | true = berulang mingguan; false = tanggal spesifik |
| Contoh | "dr. A poli anak tiap Senin & Rabu sesi pagi" | "dr. A buka praktik ekstra Sabtu 21-06 sesi sore (ada lonjakan pasien)" | true → pilih hari Senin,Rabu; false → pilih tanggal 21-06-2026 |
| Input field utama | `hari` (multi) + periode berlaku | `tgl_spesifik` | menentukan apakah pakai `hari` atau `tgl_spesifik` |

**Hubungan praktis (default & kombinasi):**
- **Reguler** umumnya dibuat dengan **`pola_berulang = true`** → satu definisi menghasilkan slot mingguan otomatis sepanjang periode berlaku. Hemat input (tidak perlu input per tanggal — lihat NFR-006).
- **Tambahan** umumnya dibuat dengan **`pola_berulang = false`** → slot hanya muncul pada tanggal spesifik yang diisi, tidak berulang.
- Kombinasi lain (mis. Reguler `pola_berulang=false`, atau Tambahan `pola_berulang=true`) secara teknis mungkin namun jarang; perlu disepakati apakah diizinkan [PERLU KONFIRMASI]. Lihat BR-014.
- **Ringkas:** *Reguler/Tambahan menjawab "jenis praktik apa". Pola berulang menjawab "slotnya diulang otomatis atau tidak".*

### Out Scope (TIDAK dikerjakan di modul ini)
- **Ubah kuota slot** sebagai fitur tersendiri — milik fitur **G16** (G15 menetapkan nilai kuota awal saat input jadwal dan **mengacu** G16 saat reschedule).
- **Pengaturan logika antrian** — milik fitur **G17**.
- **Pendaftaran rawat jalan/inap penuh** & penerbitan SEP — milik cluster Admisi/BPJS.
- **Penggajian/absensi/HRIS** dokter (data master dokter/STR/SIP dikonsumsi, bukan dikelola di sini).
- **Manajemen cuti pegawai non-dokter.**

## 4. Goals and Metrics

| Tujuan | Metrik Terukur | Target [ASUMSI] |
|--------|----------------|-----------------|
| Jadwal praktik terpusat sebagai sumber slot | % poli aktif yang jadwalnya diinput di G15 | 100% |
| Slot pendaftaran bersumber dari jadwal G15 | % slot kanal (loket/APM/online) yang ditarik dari jadwal G15 | 100% |
| Cegah bentrok jadwal sejak input | % jadwal baru yang dibuat tanpa konflik (dibantu panel listing existing) | ≥ 98% |
| Hilangkan booking ke slot dokter libur | % booking masuk ke slot yang sudah diblokir | 0% |
| Pasien terdampak diberitahu lebih awal | % pasien terdampak ternotifikasi sebelum tanggal kunjungan | ≥ 95% |
| Percepat penanganan re-schedule | Waktu rata-rata dari input libur → slot terblokir & notifikasi terkirim | ≤ 1 menit (otomatis) |
| Kurangi komplain jadwal di loket | Jumlah komplain "dokter tidak ada" per bulan | turun ≥ 70% |
| Akuntabilitas jadwal | % aksi jadwal (input/ubah/libur/reschedule) yang punya audit log lengkap | 100% |
| Sinkronisasi antar kanal | Selisih ketersediaan slot antar kanal (loket/APM/online) | 0 (real-time/near real-time) |

*Target angka [ASUMSI] — perlu disepakati manajemen RS [PERLU KONFIRMASI].*

## 5. Related Feature

Dari List Fitur V2 (cluster **Core Integration**) dan modul lintas-cluster:

| Code | Menu / Fitur | Relasi dengan G15 |
|------|--------------|-------------------|
| **G15** | Facility Management > Jadwal dokter > **Jadwal dokter (Input Jadwal, Libur & Re-schedule)** | Modul ini |
| **G16** | Jadwal dokter > Ubah kuota | G15 set kuota awal saat input jadwal; saat reschedule kuota slot baru mengacu/ditarik dari G16 |
| **G17** | Jadwal dokter > Pengaturan antrian | Slot dari jadwal G15, slot terblokir & pasien re-schedule memengaruhi nomor antrian |
| G1–G2 | Billing/Kasir | [ASUMSI] re-schedule tidak mengubah tagihan kecuali batal layanan |
| — | Admisi/Pendaftaran (g-admisi-*) | Konsumen jadwal praktik, status ketersediaan & slot terblokir |
| G23 | SATUSEHAT > Patient Profile Sync | Identitas dokter/pasien konsisten dengan SATUSEHAT |
| G24 | SATUSEHAT > Encounter Sync | Perubahan jadwal dapat memengaruhi rencana encounter [ASUMSI] |
| — | Internal Consult/Referral (g-service-internal-*) | Validasi "jadwal tersedia" memakai data jadwal/ketersediaan dari G15 |
| — | Master Dokter/Pegawai | Sumber identitas, poli, kompetensi dokter saat input jadwal & pemilihan pengganti |
| — | Modul Notifikasi | Kanal penyampaian perubahan ke pasien/petugas |

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI]
1. Jadwal praktik dokter dibuat manual (Excel/papan/cetakan) di poli, tidak terhubung ke sistem pendaftaran.
2. Saat membuat jadwal baru, petugas mengandalkan ingatan/cetakan untuk cek bentrok → sering meleset.
3. Dokter mengabarkan libur/ganti jadwal via telepon/WA ke koordinator poli.
4. Koordinator catat manual & informasikan ke petugas loket secara lisan.
5. Slot di sistem pendaftaran tidak bersumber dari jadwal resmi / **tetap terbuka** → pasien masih bisa booking dokter yang libur.
6. Pasien yang sudah booking tidak dihubungi sistematis; sebagian baru tahu saat datang.
7. Tidak ada catatan resmi/audit pembuatan & perubahan jadwal.

### B. To-Be (kondisi diharapkan) — turunan analogi BPMN [ASUMSI]
1. **Petugas/Koordinator Poli** membuka modul G15; sebelum input, sistem menampilkan **panel listing jadwal existing** dokter/poli terkait sebagai acuan (FR-019).
2. **Petugas/Koordinator Poli** **menginput jadwal praktik** dokter (dokter, poli, tipe jadwal Reguler/Tambahan, pola berulang true/false, hari atau tanggal, sesi, jam, kuota ref G16, ruangan, periode berlaku) → jadwal menjadi **sumber slot** yang di-generate untuk kanal pendaftaran.
3. **Gateway: Jadwal bentrok?** → sistem validasi tidak ada tumpang tindih sesi/ruang/dokter pada hari & jam yang sama (analogi *"Validasi: Poli/Jadwal/Kuota tersedia"*). Bentrok → tolak/peringatkan (panel listing bantu cegah dini).
4. *(Pengecualian — di atas jadwal master)* **Petugas/Koordinator Poli** input pengajuan **Libur / Re-schedule / Pembatalan** dokter (analogi: aktivitas *"Ubah data pendaftaran — reschedule jadwal"* di g-admisi-inpatient-registration).
5. **Gateway: Perlu persetujuan?** → bila ya, **Approver (Kepala Pelayanan Medis/Manajemen)** menyetujui/menolak. (Dapat dimatikan untuk RS kecil.)
6. **Gateway: Ada dokter pengganti?** → Ya: tunjuk pengganti pada slot; Tidak: slot dibatalkan/diblokir.
7. Sistem **memblokir/mengubah slot terdampak** di semua kanal (slot turunan jadwal master).
8. Sistem menjalankan **Deteksi pasien terdampak** (yang sudah booking pada slot terdampak).
9. **Gateway: Ada pasien terdampak?** → Ya: tawarkan re-schedule ke slot pengganti / poli pengganti, lalu **kirim notifikasi**; Tidak: lanjut.
10. Sistem **catat audit log** (analogi *"Log Audit: Siapa, Kapan, Order/Status Apa"*).
11. **Event akhir:** Jadwal ter-update & sinkron; pasien & petugas ternotifikasi.

## 7. Main Flow / Mindmap

**Aktor:** Koordinator/Admin Poli (pengaju & input jadwal), Approver (Ka. Yanmed/Manajemen), Dokter (subjek jadwal), Petugas Pendaftaran/Admisi (konsumen), Pasien (penerima notifikasi), Sistem SIMRS.

### Skenario 0 — Input/Buat Jadwal Praktik Dokter (master)
```
[Start] Koordinator/Admin Poli buka modul Jadwal Dokter → menu Input Jadwal
  → Pilih dokter + poli/unit
  → Sistem TAMPILKAN panel listing jadwal existing dokter/poli tsb (FR-019)
        (jadwal reguler & tambahan aktif, hari/sesi/jam, ruangan, periode,
         indikator slot terisi) → acuan agar tidak bentrok
  → Tentukan tipe jadwal: Reguler / Tambahan(insidental)
  → Tentukan pola berulang:
        pola_berulang = true  → pilih hari (Senin–Minggu) [lazimnya Reguler]
        pola_berulang = false → pilih tanggal spesifik    [lazimnya Tambahan]
  → Tentukan sesi (pagi/siang/sore), jam mulai–selesai
  → Set kuota slot (nilai awal, ref G16) + ruangan + periode berlaku (tgl mulai–selesai)
  → Gateway: Jadwal bentrok? (dokter/ruang/sesi tumpang tindih, jam tidak valid)
        Bentrok → tampilkan error "Jadwal bentrok / tidak valid" + sorot baris bentrok di panel listing → ulangi
        Tidak → simpan
  → Gateway: Perlu approval input jadwal? [ASUMSI konfigurabel]
        Ya → Approver review → Setuju/Tolak
        Tidak → aktif langsung
  → Sistem generate slot turunan & ekspos ke kanal pendaftaran (FR-013/FR-017)
  → Tulis audit log → [End] Jadwal aktif sebagai sumber slot
```

### Skenario 1 — Dokter Libur/Cuti (dengan pengganti)
```
[Start] Pengaju buka modul Jadwal Dokter → pilih dokter
  → Pilih aksi: Libur/Cuti → isi rentang tanggal, alasan
  → Gateway: Perlu approval? 
        Ya → Approver review → (Setuju / Tolak)
              Tolak → [End: ditolak, jadwal tetap]
        Tidak → lanjut
  → Gateway: Ada dokter pengganti?
        Ya → tunjuk pengganti pada slot terdampak
        Tidak → slot diblokir (tanpa pengganti)
  → Sistem blokir/alihkan slot di semua kanal
  → Deteksi pasien terdampak (sudah booking pada slot)
  → Gateway: Ada pasien terdampak?
        Ya → tawarkan re-schedule / pindah ke pengganti → kirim notifikasi
        Tidak → lanjut
  → Tulis audit log
  → [End] Jadwal ter-update & sinkron
```

### Skenario 2 — Re-schedule (pindah hari/jam/poli sementara)
```
[Start] Pengaju pilih dokter → aksi Re-schedule
  → Sistem tampilkan panel listing slot/jadwal existing dokter sbg acuan slot baru
  → Pilih slot asal + tentukan slot baru (tanggal/jam/poli, ref kuota G16)
  → Gateway: Slot baru bentrok? (validasi jadwal/kuota)
        Bentrok → tampilkan error "Jadwal/Kuota tidak tersedia" → ulangi
        Tidak → simpan
  → Pindahkan pasien terdampak ke slot baru (otomatis/manual) → notifikasi
  → Audit log → [End]
```

### Skenario 3 — Pembatalan Praktik (tanpa pengganti)
```
[Start] Pengaju pilih dokter → aksi Batalkan sesi → konfirmasi
  → Slot diblokir, status CANCELLED
  → Pasien terdampak: notifikasi pembatalan + arahan (daftar ulang/poli lain)
  → Audit log → [End]
```
*Seluruh percabangan gateway diturunkan secara analogi [ASUMSI].*

## 8. Business Rules

- **BR-001** — Slot pada tanggal/sesi yang berstatus *Libur/Cuti/Batal* TIDAK boleh dapat dibooking di kanal manapun (loket/APM/online). (traceability: To-Be langkah 7; analogi validasi jadwal g-service-internal-consult)
- **BR-002** — Rentang tanggal libur tidak boleh `tgl_selesai < tgl_mulai`; `tgl_mulai` ≥ hari ini kecuali pencatatan retroaktif oleh admin [PERLU KONFIRMASI].
- **BR-003** — Bila **ada dokter pengganti**, pengganti harus memiliki kompetensi/poli yang sesuai dan tidak bentrok dengan jadwalnya sendiri. (analogi keputusan "Ada pengganti?")
- **BR-004** — Re-schedule ke slot baru hanya boleh bila **kuota slot baru tersedia** (kuota mengacu G16). Bila penuh → tolak dengan pesan error. (analogi "Kuota penuh")
- **BR-005** — Setiap aksi jadwal (input/ubah/hapus jadwal, libur/reschedule/batal/approve/tolak) WAJIB tercatat di audit log: user, timestamp, aksi, nilai sebelum→sesudah. (analogi "Log Audit")
- **BR-006** — Pasien terdampak yang sudah terdaftar WAJIB dipicu notifikasi sebelum tanggal kunjungan; bila notifikasi gagal, masuk antrian retry & ditampilkan ke petugas untuk tindak lanjut manual. (kendala internet RS C&D)
- **BR-007** — Workflow approval bersifat **konfigurabel**: dapat dimatikan (auto-approve) untuk RS kecil — berlaku untuk input jadwal maupun pengecualian. [ASUMSI]
- **BR-008** — Perubahan jadwal yang sudah disetujui tidak dapat dihapus, hanya dinonaktifkan/dibatalkan/di-override dengan jejak audit baru.
- **BR-009** — Libur dokter yang tumpang tindih dengan pengajuan lain pada rentang sama → sistem peringatkan duplikasi. [ASUMSI]
- **BR-010 (input jadwal)** — Jadwal praktik baru TIDAK boleh bentrok: satu dokter tidak boleh punya dua sesi pada hari & jam yang tumpang tindih; satu ruangan tidak boleh dipakai dua dokter pada slot waktu sama [PERLU KONFIRMASI aturan ruang]. `jam_selesai > jam_mulai`. (To-Be langkah 3)
- **BR-011 (input jadwal)** — Setiap jadwal punya **periode berlaku** (tgl mulai, opsional tgl selesai/berulang). Slot hanya di-generate dalam periode berlaku & saat status jadwal = aktif.
- **BR-012 (input jadwal)** — Kuota awal slot ditetapkan saat input jadwal; perubahan kuota setelah aktif mengikuti G16. Kuota harus > 0.
- **BR-013 (input jadwal)** — Menonaktifkan/menghapus jadwal yang sudah punya booking aktif WAJIB melalui penanganan pasien terdampak (deteksi + notifikasi), tidak boleh hard-delete diam-diam.
- **BR-014 (tipe vs pola)** — `tipe_jadwal` (Reguler/Tambahan) dan `pola_berulang` (true/false) adalah dua dimensi independen. Default: Reguler→`pola_berulang=true` (input via `hari`); Tambahan→`pola_berulang=false` (input via `tgl_spesifik`). Bila `pola_berulang=true` maka field `hari` wajib; bila `false` maka field `tgl_spesifik` wajib. Apakah kombinasi non-default (Reguler+false / Tambahan+true) diizinkan → [PERLU KONFIRMASI]. (Section 3 — Konsep Jadwal)
- **BR-015 (panel listing)** — Saat input/ubah/reschedule jadwal, panel listing jadwal existing HANYA menampilkan jadwal aktif & menunggu approval pada dokter/poli yang relevan; dipakai sebagai acuan dan rujukan deteksi bentrok (read-only, tidak mengubah data). (FR-019)

## 9. User Stories

- **US-001** — Sebagai **Koordinator Poli**, saya ingin **menginput jadwal praktik reguler dokter** (poli, hari/pola, sesi, jam, kuota, ruangan, periode berlaku), agar jadwal menjadi sumber slot terpusat untuk semua kanal pendaftaran. *(source: analogi master jadwal & validasi jadwal g-service-internal-consult)*
- **US-002** — Sebagai **Koordinator Poli**, saya ingin **mengubah/menonaktifkan jadwal praktik** yang sudah ada, agar perubahan struktur jadwal terkelola dan slot ter-generate ulang dengan benar. *(analogi CRUD master)*
- **US-003** — Sebagai **Koordinator Poli**, saya ingin menambah **jadwal/sesi insidental (tambahan)** di luar pola reguler, agar praktik tambahan tetap tercatat sebagai slot resmi.
- **US-004** — Sebagai **Sistem**, saya ingin **memvalidasi bentrok jadwal** (dokter/ruang/jam) saat input, agar tidak ada tumpang tindih sesi. *(analogi "Validasi: Poli/Jadwal/Kuota tersedia")*
- **US-005** — Sebagai **Koordinator Poli**, saya ingin mencatat libur/cuti dokter beserta rentang tanggal & alasan, agar slot terdampak otomatis terblokir di semua kanal. *(analogi "Ubah data pendaftaran — reschedule jadwal", g-admisi-inpatient-registration)*
- **US-006** — Sebagai **Koordinator Poli**, saya ingin menunjuk dokter pengganti pada slot yang ditinggalkan, agar pelayanan tetap berjalan. *(analogi keputusan "Tindak lanjut/Ada pengganti")*
- **US-007** — Sebagai **Koordinator Poli**, saya ingin me-reschedule sesi praktik ke hari/jam/poli lain, agar perubahan sementara terkelola rapi. *(analogi reschedule)*
- **US-008** — Sebagai **Sistem**, saya ingin memvalidasi ketersediaan & kuota slot baru sebelum reschedule, agar tidak terjadi overbooking. *(analogi "Validasi: Poli/Jadwal/Kuota tersedia", g-service-internal-consult)*
- **US-009** — Sebagai **Sistem**, saya ingin mendeteksi pasien yang sudah booking pada slot terdampak, agar mereka bisa di-reschedule/diberitahu. *(analogi "Cari Pasien dari List")*
- **US-010** — Sebagai **Pasien**, saya ingin menerima notifikasi perubahan/pembatalan jadwal dokter, agar tidak datang sia-sia. *(analogi notifikasi g-service-cpo-timing)*
- **US-011** — Sebagai **Approver (Ka. Yanmed)**, saya ingin menyetujui/menolak input & perubahan jadwal, agar jadwal terkendali.
- **US-012** — Sebagai **Petugas Pendaftaran**, saya ingin melihat jadwal praktik & status terkini ketersediaan dokter saat mendaftarkan pasien, agar tidak salah sesi. *(konsumen data; analogi g-admisi)*
- **US-013** — Sebagai **Manajemen**, saya ingin melihat dashboard/kalender jadwal praktik, libur & perubahan jadwal, agar perencanaan tenaga medis terpantau.
- **US-014** — Sebagai **Auditor/Admin**, saya ingin menelusuri audit log input & perubahan jadwal, agar ada akuntabilitas. *(analogi "Log Audit: Siapa, Kapan, Apa")*
- **US-015** — Sebagai **Petugas**, saya ingin melihat daftar notifikasi gagal-kirim untuk ditindaklanjuti manual, agar pasien tetap diberitahu saat internet bermasalah. *(kendala RS C&D)*
- **US-016 [BARU]** — Sebagai **Koordinator Poli**, saya ingin **melihat panel listing jadwal existing dokter/poli saat akan membuat jadwal baru**, agar saya tahu slot yang sudah terpakai dan terhindar dari bentrok hari/jam/ruangan sebelum menyimpan. *(diturunkan dari instruksi user; analogi acuan slot pada validasi jadwal g-service-internal-consult)*
- **US-017 [BARU]** — Sebagai **Koordinator Poli**, saya ingin membedakan jelas antara jadwal **Reguler**, **Tambahan**, dan opsi **Pola Berulang** saat input, agar saya memilih tipe & mekanisme generate slot yang benar tanpa salah konsep. *(diturunkan dari instruksi user; Section 3 — Konsep Jadwal)*

## 10. Functional Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| **FR-001** | Sistem menyediakan **CRUD jadwal praktik dokter** (input/ubah/nonaktifkan): dokter, poli/unit, hari/pola berulang, sesi, jam mulai–selesai, kuota awal, ruangan, periode berlaku. | US-001, US-002, To-Be#2 |
| **FR-002** | Sistem mendukung **dua tipe jadwal**: **Reguler** & **Tambahan/insidental** (`tipe_jadwal`), dan **opsi `pola_berulang`** (true=mingguan via `hari`, false=tanggal spesifik via `tgl_spesifik`) sebagai dimensi terpisah; UI menampilkan label/penjelasan singkat tiap pilihan. | US-003, US-017, BR-014 |
| **FR-003** | Sistem **memvalidasi bentrok jadwal** saat input/ubah (dokter & ruang tidak tumpang tindih pada slot waktu sama; `jam_selesai > jam_mulai`; kuota > 0); tampilkan pesan error spesifik. | US-004, BR-010, BR-012 |
| **FR-004** | Sistem **men-generate slot turunan** dari jadwal aktif sesuai tipe/pola & periode berlaku, dan mengeksposnya ke kanal pendaftaran/antrian. | US-001, BR-011, FR-017 |
| **FR-005** | Sistem menyediakan form input **Libur/Cuti** dokter (dokter, rentang tanggal, alasan, opsi pengganti). | US-005, To-Be#4 |
| **FR-006** | Sistem menyediakan form **Re-schedule** (slot asal → slot baru: tanggal/jam/poli). | US-007, To-Be#4 |
| **FR-007** | Sistem menyediakan aksi **Pembatalan** sesi praktik dengan konfirmasi. | Skenario 3 |
| **FR-008** | Sistem memvalidasi rentang tanggal & bentrok jadwal/kuota slot baru sebelum simpan; tampilkan pesan error spesifik. | BR-002, BR-004, US-008 |
| **FR-009** | Sistem **memblokir slot terdampak** otomatis di semua kanal pendaftaran (loket/APM/online) setelah perubahan disimpan/disetujui. | BR-001, To-Be#7 |
| **FR-010** | Sistem mendukung **penunjukan dokter pengganti** dengan validasi kompetensi/poli & non-bentrok. | US-006, BR-003 |
| **FR-011** | Sistem **mendeteksi daftar pasien terdampak** (booking aktif pada slot terdampak), termasuk saat jadwal dinonaktifkan/diubah. | US-009, BR-013, To-Be#8 |
| **FR-012** | Sistem mendukung **re-schedule pasien terdampak** (otomatis ke slot pengganti / manual pilih slot) dengan cek kuota. | US-009, BR-004 |
| **FR-013** | Sistem memicu **notifikasi** ke pasien & petugas atas perubahan/pembatalan, dengan **retry & daftar gagal-kirim**. | US-010, US-015, BR-006 |
| **FR-014** | Sistem mendukung **workflow approval** konfigurabel (on/off) untuk input jadwal & pengecualian (pengaju→approver, setuju/tolak). | US-011, BR-007 |
| **FR-015** | Sistem mencatat **audit log** setiap aksi jadwal (user, timestamp, aksi, before→after). | US-014, BR-005 |
| **FR-016** | Sistem menampilkan **dashboard/kalender** jadwal praktik, libur & perubahan dokter dengan filter unit/poli/dokter/tanggal. | US-013 |
| **FR-017** | Sistem mengekspos **jadwal & status ketersediaan dokter** ke modul pendaftaran/antrian (API/integrasi internal). | US-012, FR-004, FR-009 |
| **FR-018** | Sistem mendukung mode **tindak lanjut manual** saat integrasi notifikasi/kanal gagal (degradasi anggun). | US-015, BR-006 |
| **FR-019 [BARU]** | Sistem menampilkan **panel listing jadwal existing** (read-only) dokter/poli terkait pada layar input/ubah/reschedule jadwal: tipe jadwal, hari/tanggal, sesi, jam, ruangan, kuota, periode berlaku, status, indikator slot terisi. Panel mendukung filter (dokter/poli/hari/tanggal) & sort, dan menyorot baris yang berpotensi bentrok dengan input baru. | US-016, BR-015, To-Be#1 |

## 11. Data Requirements (Spesifikasi Field)

Catatan konsistensi lintas-PRD: field identitas mengikuti definisi bersama — `nik` = 16 digit (Disdukcapil), `nip` (jika dipakai) = unik. Belum ada blok "Konteks PRD terkait" yang dikirim → definisi entitas dokter/pasien di sini bersifat awal, selaraskan dengan modul Admisi/Pendaftaran & Master Dokter bila berbeda [PERLU KONFIRMASI].

### A. Form Input — Jadwal Praktik Dokter (FR-001/FR-002)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| id_jadwal | ID Jadwal | text | Ya | auto, unik | auto-generate | |
| dokter_id | Dokter | lookup | Ya | dari master dokter | lookup master dokter | identitas konsisten lintas-PRD; pemilihan memicu panel listing (FR-019) |
| poli_unit | Poli/Unit | lookup | Ya | dari master poli/unit | lookup | |
| tipe_jadwal | Tipe Jadwal | dropdown | Ya | Reguler / Tambahan(insidental) | enum | **makna bisnis** praktik; Reguler=rutin, Tambahan=sesi ekstra. Lihat Section 3 |
| pola_berulang | Pola Berulang? | boolean | Ya | true/false | default: true bila Reguler, false bila Tambahan (BR-014) | **mekanisme generate slot**, BUKAN tipe. true=mingguan per hari; false=tanggal spesifik |
| hari | Hari Praktik | dropdown(multi) | Kondisional | Senin–Minggu | enum | **wajib bila pola_berulang=true** (BR-014) |
| tgl_spesifik | Tanggal Praktik | date(multi) | Kondisional | ≥ hari ini | manual | **wajib bila pola_berulang=false** (umumnya Tambahan) |
| sesi | Sesi | dropdown | Ya | Pagi/Siang/Sore/Malam | enum | |
| jam_mulai | Jam Mulai | time | Ya | HH:mm | manual | |
| jam_selesai | Jam Selesai | time | Ya | > jam_mulai (BR-010) | manual | |
| kuota | Kuota Slot | number | Ya | > 0 (BR-012) | manual / default G16 | nilai awal, perubahan via G16 |
| ruangan | Ruangan | lookup | Tidak | master ruangan | lookup | non-bentrok ruang [PERLU KONFIRMASI] |
| tgl_berlaku_mulai | Berlaku Mulai | date | Ya | ≥ hari ini | manual | BR-011 (relevan utama utk Reguler/berulang) |
| tgl_berlaku_selesai | Berlaku Sampai | date | Tidak | ≥ tgl_berlaku_mulai | manual | kosong = berlaku terus |
| status_jadwal | Status | dropdown | Ya | Aktif/Nonaktif/Menunggu Approval | enum | default sesuai BR-007 |
| keterangan | Keterangan | text | Tidak | maks 250 char | manual | |

### A2. Tampilan — Panel Listing Jadwal Existing (FR-019) **[BARU]**
Read-only; muncul di layar input/ubah/reschedule jadwal sebagai acuan & deteksi bentrok dini. Difilter ke dokter/poli yang sedang dipilih.

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Dokter | jadwal.dokter → master dokter.nama | text | filter (default = dokter terpilih) | |
| Poli/Unit | jadwal.poli_unit | text | filter | |
| Tipe Jadwal | jadwal.tipe_jadwal | badge (Reguler/Tambahan) | filter | bedakan rutin vs insidental |
| Pola | jadwal.pola_berulang | badge (Berulang/Tanggal spesifik) | filter | |
| Hari/Tanggal | jadwal.hari atau jadwal.tgl_spesifik | teks (hari) / tanggal | sort | tergantung pola |
| Sesi & Jam | jadwal.sesi + jam_mulai–jam_selesai | teks (HH:mm–HH:mm) | sort | dipakai cek bentrok jam |
| Ruangan | jadwal.ruangan | text / "-" | filter | dipakai cek bentrok ruang |
| Kuota | jadwal.kuota | angka | – | nilai awal (ref G16) |
| Slot Terisi | agregasi booking aktif / kuota | "x / y" + bar | sort | indikator beban; bantu putuskan jadwal baru |
| Periode Berlaku | tgl_berlaku_mulai–selesai | rentang tanggal / "terus" | filter periode | |
| Status | jadwal.status_jadwal | badge (Aktif/Nonaktif/Menunggu Approval) | filter | hanya aktif & menunggu yang relevan (BR-015) |
| Indikator Bentrok | dihitung vs input form berjalan | badge merah "Potensi bentrok" | sort | sorot baris tumpang tindih hari/jam/ruang (FR-019) |

### B. Form Input — Pengajuan Libur/Cuti Dokter (FR-005)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| id_pengajuan | ID Pengajuan | text | Ya | auto, unik | auto-generate | |
| dokter_id | Dokter | lookup | Ya | dari master dokter | lookup master dokter | |
| jenis_pengecualian | Jenis | dropdown | Ya | Libur/Cuti/Re-schedule/Batal | enum | |
| tgl_mulai | Tanggal Mulai | date | Ya | ≥ hari ini [PERLU KONFIRMASI retroaktif] | manual | BR-002 |
| tgl_selesai | Tanggal Selesai | date | Ya | ≥ tgl_mulai | manual | BR-002 |
| sesi_terdampak | Sesi/Jam Terdampak | dropdown(multi) | Tidak | dari slot dokter (jadwal G15) | lookup slot | kosong = seluruh sesi pada rentang |
| poli_unit | Poli/Unit | lookup | Ya | dari master poli/unit | lookup | |
| alasan | Alasan | dropdown | Ya | cuti/sakit/dinas/lainnya | enum | |
| keterangan | Keterangan | text | Tidak | maks 250 char | manual | |
| ada_pengganti | Ada Pengganti? | boolean | Ya | true/false | default false | trigger BR-003 |
| dokter_pengganti_id | Dokter Pengganti | lookup | Kondisional | wajib bila ada_pengganti=true; non-bentrok | lookup master dokter | FR-010 |
| lampiran | Lampiran (surat cuti) | file | Tidak | pdf/jpg, ≤ 5MB | upload | [ASUMSI] |

### C. Form Input — Re-schedule Slot (FR-006)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| slot_asal_id | Slot Asal | lookup | Ya | slot aktif dokter (jadwal G15) | lookup jadwal | dipilih dari panel listing (FR-019) |
| tgl_baru | Tanggal Baru | date | Ya | ≥ hari ini | manual | |
| jam_mulai_baru | Jam Mulai Baru | time | Ya | HH:mm | manual | |
| jam_selesai_baru | Jam Selesai Baru | time | Ya | > jam_mulai_baru | manual | |
| poli_baru | Poli/Unit Baru | lookup | Tidak | master poli | lookup | default = poli asal |
| kuota_baru | Kuota Slot Baru | number | Tidak | > 0 | dari G16 | mengacu G16, BR-004 |
| aksi_pasien | Penanganan Pasien Terdampak | dropdown | Ya | auto-pindah / manual / notifikasi saja | enum | FR-012 |

### D. Form Input — Penanganan Pasien Terdampak (FR-012)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| booking_id | ID Booking/Pendaftaran | lookup | Ya | booking aktif | sistem (FR-011) | |
| pasien_nama | Nama Pasien | text | Ya | read-only | master pasien | tampilan |
| pasien_nik | NIK | text | Tidak | 16 digit | master pasien/Disdukcapil | konsistensi lintas-PRD |
| no_kontak | No. Kontak/WA | text | Ya | format telp ID | master pasien | sasaran notifikasi |
| is_rawat_inap | Pasien Rawat Inap? | boolean | Ya | true/false | sistem | penanda penanganan khusus |
| kebutuhan_isolasi | Kebutuhan Isolasi | boolean | Tidak | true/false | master pasien/admisi | dipertimbangkan saat alih ruang/sesi [ASUMSI] |
| slot_tujuan_id | Slot Tujuan | lookup | Kondisional | kuota tersedia | lookup (G16) | wajib bila auto/manual pindah |
| status_penanganan | Status | dropdown | Ya | menunggu/dijadwal ulang/dibatalkan | enum | |

### E. Form Input — Approval (FR-014)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| objek_approval | Objek | dropdown | Ya | Input Jadwal / Libur / Reschedule / Batal | enum | konteks yang disetujui |
| keputusan | Keputusan | dropdown | Ya | Setuju/Tolak | enum | |
| catatan_approval | Catatan | text | Kondisional | wajib bila Tolak | manual | |
| approver_id | Approver | lookup | Ya | user role approver | sesi login | audit |

### F. Tampilan — Dashboard/Kalender Jadwal & Libur (FR-016)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Total Jadwal Aktif | count jadwal status Aktif | angka besar (kartu) | – | ringkasan |
| Total Dokter Libur Hari Ini | count pengajuan aktif jenis Libur/Cuti where tanggal=today | angka besar (kartu) | – | ringkasan |
| Total Re-schedule Minggu Ini | count jenis Re-schedule rentang minggu | angka besar (kartu) | – | ringkasan |
| Dokter | master dokter.nama | text | sort A-Z, filter | |
| Poli/Unit | master poli | text | filter | |
| Tipe Jadwal | jadwal.tipe_jadwal | badge (Reguler/Tambahan) | filter | |
| Jadwal (hari/sesi/jam) | jadwal.hari/tgl + sesi + jam | teks/kalender | filter | sumber slot |
| Ruangan | jadwal.ruangan | text / "-" | filter | |
| Tanggal (pengecualian) | tgl_mulai–tgl_selesai | rentang tanggal | filter periode | |
| Jenis | jenis_pengecualian | badge (Libur/Cuti/Reschedule/Batal) | filter | warna per jenis |
| Pengganti | dokter_pengganti.nama | text / "-" | – | |
| Status Approval | workflow status | badge (Diajukan/Disetujui/Ditolak) | filter | input jadwal & pengecualian |
| Pasien Terdampak | count booking terdampak | angka | sort desc | klik → detail |
| Status Notifikasi | hasil pengiriman | badge (Terkirim/Gagal/Menunggu) | filter | merah jika gagal (BR-006) |

### G. Tampilan — List Pasien Terdampak (FR-011)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | booking.no_rm | text | sort | |
| Nama Pasien | master pasien.nama | text | sort A-Z | |
| Rawat Inap? | booking.is_rawat_inap | badge (Ya/Tidak) | filter | penanda penanganan khusus |
| Slot Asal | jadwal.slot_asal | tgl + jam | sort | |
| Slot Tujuan | penanganan.slot_tujuan | tgl + jam / "-" | – | hasil reschedule |
| Status Penanganan | penanganan.status | badge | filter | |
| Status Notifikasi | notifikasi.status | badge (Terkirim/Gagal/Menunggu) | filter | retry (FR-013) |

### H. Tampilan — Audit Log (FR-015)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| Waktu | audit.timestamp | datetime | sort desc | |
| User | audit.user | text | filter | |
| Aksi | audit.action | badge | filter | create-jadwal/update-jadwal/nonaktif/libur/reschedule/cancel/approve/reject |
| Objek | audit.entity (jadwal/dokter/slot) | text | – | |
| Sebelum → Sesudah | audit.before/after | teks ringkas | – | |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)** — Generate slot dari jadwal, pemblokiran slot & pemicuan notifikasi setelah simpan/approve selesai ≤ 1 menit (lihat metrik). Panel listing jadwal existing (FR-019) tampil ≤ 2 detik. [ASUMSI]
- **NFR-002 (Ketersediaan/Resiliensi)** — Internet RS C&D tidak stabil: notifikasi memakai **antrian + retry**; bila gagal, masuk daftar tindak lanjut manual (FR-013, FR-018). Modul tetap dapat dioperasikan petugas saat kanal eksternal offline.
- **NFR-003 (Konsistensi data)** — Jadwal praktik = sumber tunggal slot; status ketersediaan dokter sinkron antar kanal (loket/APM/online); selisih ditargetkan 0 (near real-time via FR-017).
- **NFR-004 (Keamanan & otorisasi)** — Hanya role berwenang (Koordinator/Admin Poli untuk input/ubah jadwal, Approver untuk persetujuan) dapat mengubah jadwal; tindakan tercatat audit. Role-based access control.
- **NFR-005 (Auditability)** — Semua aksi jadwal (termasuk input) immutable-logged (BR-005, BR-008).
- **NFR-006 (Usability)** — UI sederhana, minim training (SDM IT terbatas); input jadwal mendukung pola berulang agar tidak input per-tanggal; panel listing existing & label tipe/pola jelas agar petugas tidak salah konsep; aksi umum (input jadwal, libur, ganti, batal) ≤ 3 klik dari kalender.
- **NFR-007 (Skalabilitas ringan)** — Cukup untuk RS C&D (puluhan dokter, ratusan slot/hari); tidak butuh infrastruktur berat. [ASUMSI]
- **NFR-008 (Audit waktu/zona)** — Timestamp memakai zona waktu RS (WIB/WITA/WIT) konsisten. [PERLU KONFIRMASI zona]
- **NFR-009 (Lokalisasi)** — Bahasa Indonesia, format tanggal `dd-MM-yyyy`, jam 24-jam.

## 13. Integrasi Eksternal

| Integrasi | Arah | Tujuan | Catatan |
|-----------|------|--------|---------|
| **Modul Pendaftaran/Admisi** (internal) | G15 ↔ Admisi | Ekspos jadwal praktik, slot ter-generate, status ketersediaan & slot terblokir | FR-004, FR-009, FR-017; analogi g-admisi-* |
| **Modul Antrian (G17)** (internal) | dua arah | Slot dari jadwal G15, slot terblokir & reschedule memengaruhi nomor antrian | analogi g-service-internal-consult (antrian) |
| **Ubah Kuota (G16)** (internal) | G15 ↔ G16 | G15 set kuota awal saat input jadwal; G16 sumber kuota slot saat reschedule | BR-004, BR-012, FR-012 |
| **Master Dokter/Pegawai/HRIS** | konsumsi | Data dokter, poli, kompetensi, STR/SIP untuk input jadwal & validasi pengganti; sumber data panel listing (FR-019) | [PERLU KONFIRMASI sumber master & field STR/SIP] |
| **Master Ruangan/Fasilitas** | konsumsi | Validasi non-bentrok ruangan saat input jadwal; ditampilkan di panel listing | [PERLU KONFIRMASI apakah aturan ruang diberlakukan] |
| **Modul Notifikasi** (internal/eksternal: SMS/WA) | G15 → pasien/petugas | Kirim perubahan/pembatalan jadwal | FR-013, retry karena internet C&D |
| **SATUSEHAT — Patient Profile (G23)** | konsumsi | Identitas pasien/dokter konsisten | [ASUMSI keterkaitan] |
| **SATUSEHAT — Encounter Sync (G24)** | opsional | Perubahan jadwal dapat memengaruhi rencana encounter | [PERLU KONFIRMASI apakah jadwal termasuk resource Schedule/Slot/Encounter FHIR] |

*Catatan SATUSEHAT [ASUMSI]:* jadwal praktik dapat dipetakan ke resource FHIR `Schedule`/`Slot`/`PractitionerRole` bila RS ingin interoperabilitas; belum wajib untuk MVP G15 [PERLU KONFIRMASI].

## Asumsi
- Modul G15 sekarang mencakup input jadwal praktik (master) DAN pengelolaan pengecualian (libur/reschedule/batal) — sebelumnya input jadwal dianggap modul terpisah.
- Panel listing jadwal existing (FR-019) bersifat read-only & sebagai acuan/pencegah bentrok; tidak mengubah data jadwal.
- Tipe jadwal (Reguler/Tambahan) dan pola berulang (true/false) adalah dua dimensi independen; default Reguler→berulang, Tambahan→tanggal spesifik. Kombinasi non-default perlu konfirmasi.
- Modul G15 belum punya BPMN sendiri; alur input jadwal & As-Is/To-Be diturunkan analogi dari g-admisi-inpatient-registration (reschedule), g-service-internal-consult/referral (validasi jadwal/kuota), g-service-cpo-* (log audit & notifikasi).
- Jadwal aktif men-generate slot turunan yang dikonsumsi kanal pendaftaran; pengecualian bekerja di atas slot tersebut tanpa menghapus jadwal master.
- Kuota awal slot ditetapkan saat input jadwal; perubahan kuota setelah aktif memakai fitur G16; logika antrian dari G17.
- Target metrik (100% slot dari G15, 0% booking slot libur, ≥95% notifikasi, ≤1 menit, ≥98% jadwal tanpa konflik) adalah usulan awal, perlu disepakati manajemen.
- Workflow approval bersifat konfigurabel dan dapat dimatikan untuk RS kecil, berlaku untuk input jadwal maupun pengecualian.
- Field identitas (NIK 16 digit) mengikuti definisi master/standar agar konsisten lintas-PRD.
- Notifikasi memakai pola antrian+retry karena keterbatasan jaringan RS Tipe C&D; tersedia mode tindak lanjut manual.
- Integrasi SATUSEHAT untuk jadwal bersifat opsional/fase lanjut, bukan wajib MVP.
- Validasi non-bentrok ruangan & lampiran surat cuti bersifat opsional/perlu konfirmasi.

## Pertanyaan Terbuka
- Apakah kombinasi non-default tipe×pola diizinkan? Mis. Reguler dengan pola_berulang=false, atau Tambahan dengan pola_berulang=true? (BR-014) [PERLU KONFIRMASI]
- Panel listing jadwal existing (FR-019): apakah perlu menampilkan juga jadwal dokter LAIN di ruangan/poli sama untuk cek bentrok ruang, atau cukup jadwal dokter yang dipilih?
- Indikator 'Slot Terisi' di panel listing: sumber data real-time dari modul pendaftaran/antrian atau snapshot berkala? Berapa toleransi keterlambatan?
- Apakah input jadwal praktik mendukung pola berulang mingguan saja, atau juga pola bulanan/rotasi shift kompleks? [PERLU KONFIRMASI]
- Apakah validasi bentrok ruangan (satu ruang tidak dipakai dua dokter pada slot sama) diberlakukan, dan dari master ruangan mana sumbernya?
- Apakah input/perubahan jadwal perlu approval untuk RS Tipe C&D, atau auto-approve? Siapa role approver resmi?
- Saat jadwal dinonaktifkan/diubah dan sudah ada booking, apakah pasien wajib di-reschedule otomatis atau cukup notifikasi daftar ulang?
- Kanal notifikasi pasien yang dipakai: SMS, WhatsApp, atau push aplikasi? Adakah biaya/gateway tertentu?
- Apakah pencatatan libur retroaktif (tanggal lampau) diizinkan untuk koreksi data?
- Apakah jadwal perlu disinkronkan ke SATUSEHAT (Schedule/Slot/PractitionerRole FHIR), atau cukup internal untuk MVP?
- Sumber master dokter & field kompetensi/STR/SIP untuk input jadwal & validasi dokter pengganti — dari modul mana?
- Zona waktu & format standar yang berlaku di RS (WIB/WITA/WIT)?