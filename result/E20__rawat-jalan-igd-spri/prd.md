# PRD — Surat Perintah Rawat Inap (SPRI) — Rawat Jalan & IGD

**Related Document:** List Fitur V2.xlsx (E20); PRD terkait: E13 Discharge, E11 Transfer Internal, E14 Konsultasi & Rujuk Internal, E19 Surat Kontrol, E21 Pembuatan Surat; g-service-discharge (acuan keputusan 'SPRI Sudah Ada?'); Modul Admisi Rawat Inap (TPPRI)
**Versi:** 1.1 - Penyesuaian field (tambah Tanggal_Ranap, Jenis_kasus, Jenis_Pelayanan, Ruang_Perawatan; hapus Kebutuhan_isolasi) + rencana kirim data ke SATUSEHAT
**Tanggal:** 2026-06-18

## 1. Overview / Brief Summary

Menu **Surat Perintah Rawat Inap (SPRI)** adalah fitur SIMRS untuk mengelola perintah/instruksi rawat inap pasien berdasarkan hasil asesmen dan keputusan medis dokter. SPRI menjadi dokumen elektronik penghubung antara unit asal (**Rawat Jalan / IGD**) dengan unit **Admisi Rawat Inap (TPPRI)**.

Lingkup modul E20 (cluster *Pelayanan utama*): SPRI hanya pada **Rawat Jalan (RJ)** dan **Instalasi Gawat Darurat (IGD)**.

- **RJ**: SPRI diterbitkan dokter spesialis/DPJP saat pasien dinilai butuh observasi, tindakan, atau terapi lanjutan yang tidak bisa rawat jalan. Dokter melengkapi diagnosis, indikasi, DPJP, kelas perawatan, jenis kasus, jenis pelayanan, ruang perawatan, dan rencana tanggal ranap.
- **IGD**: SPRI diterbitkan dokter jaga/spesialis untuk pasien gawat darurat yang setelah stabilisasi dinyatakan butuh rawat inap. Mencakup diagnosis kerja, indikasi medis, jenis kasus, jenis pelayanan, ruang perawatan (termasuk Isolasi), tingkat ketergantungan, dan preferensi kelas.

Setelah SPRI terbit, data diteruskan ke admisi untuk penempatan kamar & administrasi. Sistem mendukung validasi ketersediaan tempat tidur, menampilkan kapasitas ruang, dan memastikan kelengkapan data klinis/administratif sebelum transfer.

> **Rencana interoperabilitas**: Ke depan data SPRI akan **dikirim ke SATUSEHAT** (resource Encounter/ServiceRequest/Condition) sebagai bagian integrasi RME nasional. Field klinis (diagnosis, jenis pelayanan, ruang perawatan) dirancang siap dipetakan ke kode/terminologi SATUSEHAT. Detail di §13. [ASUMSI fase integrasi]

> Catatan: modul ini **belum punya BPMN sendiri**. Alur diturunkan dari analogi proses BPMN cluster Pelayanan utama (g-service-discharge, g-service-internal-referral, g-service-internal-consult) — bagian turunan ditandai `[ASUMSI]`.

## 2. Background

**Masalah saat ini (RS Tipe C & D):**
- Perintah rawat inap dari poli/IGD masih ditulis manual (kertas/SPRI fisik), rawan hilang, tidak terbaca, dan data klinis terputus saat transfer ke ranap.
- Petugas admisi tidak tahu real-time apakah pasien sudah punya SPRI atau belum → di g-service-discharge muncul keputusan *"SPRI Sudah Ada?"* yang sulit dijawab tanpa SPRI elektronik. [ASUMSI]
- Ketersediaan tempat tidur dicek manual via telepon antarunit → pasien menunggu lama, kelas tidak sesuai hak penjamin.
- Tidak ada validasi kelengkapan data klinis/administratif sebelum pasien dipindah → admisi sering menolak/mengembalikan kasus.
- Tidak ada jejak audit siapa menerbitkan/mengubah SPRI.
- Data klinis SPRI belum terstandar → menyulitkan pelaporan & **pengiriman ke SATUSEHAT** di kemudian hari.

**Kenapa modul ini perlu:**
- Menjamin kesinambungan pelayanan (continuity of care) dari unit asal ke ranap secara terdokumentasi.
- Mempercepat admisi, mengurangi dokumen manual, meminimalkan salah catat, dan meningkatkan koordinasi antarunit.
- Menyediakan single source of truth status SPRI yang dibaca modul Discharge (E13), Transfer Internal (E11), dan Admisi Ranap.
- Menyiapkan data terstruktur & ber-kode siap kirim ke **SATUSEHAT** (kepatuhan RME nasional).

## 3. In Scope

### Scope Definition (yang dikerjakan)
1. Penerbitan SPRI dari unit **Rawat Jalan** oleh dokter spesialis/DPJP.
2. Penerbitan SPRI dari unit **IGD** oleh dokter jaga/spesialis (setelah stabilisasi).
3. Form SPRI berisi: data pasien (autofill), diagnosis & indikasi, DPJP ranap, kelas perawatan (diinginkan/dijamin), **jenis kasus, jenis pelayanan, ruang perawatan, rencana tanggal ranap**, tingkat ketergantungan, kebutuhan khusus.
4. Validasi kelengkapan data klinis & administratif sebelum SPRI dapat diterbitkan.
5. Tampilan **ketersediaan & kapasitas tempat tidur** (read-only) per kelas/ruang sebagai informasi keputusan. [ASUMSI: data dari modul master bed / Admisi Ranap]
6. Pengiriman data SPRI ke unit admisi/TPPRI (status SPRI = `Diterbitkan` → menunggu admisi).
7. Daftar/monitoring SPRI (list, filter, status) per unit.
8. Edit & pembatalan SPRI sebelum diproses admisi (dengan alasan + audit log).
9. Cetak SPRI (PDF) untuk arsip/penjamin.
10. Flag status untuk dibaca modul Discharge (E13) keputusan *"SPRI Sudah Ada?"*.
11. **Persiapan struktur data** (kode diagnosis, jenis pelayanan, ruang) agar siap dikirim ke SATUSEHAT pada fase integrasi. [ASUMSI]

### Out Scope (yang TIDAK dikerjakan)
1. Proses **penempatan kamar / admisi ranap (TPPRI)** itu sendiri — milik modul Admisi Rawat Inap.
2. **Transfer internal fisik** pasien antarunit — milik E11 Transfer Internal.
3. Pembuatan SEP/penjaminan BPJS rawat inap — milik modul Pendaftaran/Penjamin (konsumsi data saja).
4. SPRI dari unit selain RJ & IGD (mis. dari ranap ke ranap, VK, IBS).
5. Penagihan/billing rawat inap (E13/Kasir).
6. Order klinis lanjutan (resep E2, penunjang E3/E4, CPO E12) — terpisah.
7. Surat lain (rujukan, kontrol, kematian) — milik E19/E21.
8. **Pengiriman aktual payload ke SATUSEHAT** = **Fase 2** (di luar MVP modul ini); MVP hanya menyiapkan field/kode. [PERLU KONFIRMASI cakupan fase 2]

## 4. Goals and Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| Percepat proses admisi dari unit asal | Rata-rata waktu dari SPRI terbit → pasien diterima admisi | < 30 menit [PERLU KONFIRMASI] |
| Hilangkan SPRI manual/kertas | % SPRI dibuat elektronik | ≥ 95% dalam 3 bulan |
| Kurangi data tidak lengkap | % SPRI ditolak admisi karena data kurang | < 5% |
| Akurasi kesesuaian kelas | % pasien ditempatkan sesuai kelas hak penjamin | ≥ 90% [PERLU KONFIRMASI] |
| Ketertelusuran | % SPRI dengan audit log lengkap (pembuat, waktu, perubahan) | 100% |
| Integrasi status | Keputusan 'SPRI Sudah Ada?' di Discharge terjawab otomatis | 100% |
| Kesiapan SATUSEHAT | % SPRI dengan field kode lengkap (diagnosis ICD-10, jenis pelayanan, ruang) siap kirim | ≥ 95% [PERLU KONFIRMASI] |

Metrik angka bertanda [PERLU KONFIRMASI] perlu disepakati manajemen RS.

## 5. Related Feature

Fitur terkait (cluster *Pelayanan utama*, List Fitur sheet MVP):

| Code | Menu | Relasi dengan SPRI |
|------|------|--------------------|
| **E20** | Rawat Jalan, IGD > **SPRI** | Modul ini |
| E10 | IGD > Triase IGD | Mendahului SPRI di IGD (stabilisasi sebelum perintah ranap) |
| E11 | Transfer internal | Eksekusi pindah pasien setelah SPRI & admisi |
| E13 | Discharge Pasien | Membaca status 'SPRI Sudah Ada?' (lihat g-service-discharge) |
| E14 | Konsultasi & Rujuk Internal (RJ) | Alternatif keputusan: rujuk internal vs rawat inap |
| E16 | Ganti DPJP (Ranap) | DPJP ranap pada SPRI jadi dasar awal |
| E19 | Surat kontrol (RJ/RI/IGD) | Sesama dokumen output pelayanan |
| E21 | Pembuatan Surat (rujukan/dll) | Bila pasien dirujuk ke RS lain alih-alih ranap internal |
| E2/E3/E4/E5/E12 | Order resep/penunjang/darah/CPO | Order klinis menyertai/menyusul rawat inap |

Modul lain (luar cluster): Admisi Rawat Inap (TPPRI), Master Bed/Ruang, Pendaftaran & Penjamin (SEP), Bridging SATUSEHAT.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (kondisi saat ini) [ASUMSI — tipikal RS Tipe C&D]
1. Dokter memutuskan pasien perlu rawat inap saat pemeriksaan di poli/IGD.
2. Dokter menulis SPRI di **formulir kertas** (diagnosis, indikasi, kelas, DPJP).
3. Keluarga/petugas membawa SPRI fisik ke loket admisi ranap.
4. Admisi menelepon ruangan untuk cek ketersediaan bed & kelas.
5. Bila bed kosong sesuai hak → administrasi & penempatan; bila tidak → menunggu/antri/rujuk.
6. Data klinis dari unit asal ditulis ulang manual → risiko salah/terlambat.
7. Tidak ada status elektronik → modul lain (Discharge) tak tahu SPRI sudah ada.

### B. To-Be (kondisi diharapkan) — turunan analogi BPMN
1. **Trigger**: Dokter selesai asesmen di RJ/IGD; pasien dinilai perlu rawat inap.
2. **(IGD)** Pasien sudah melewati Triase (E10) & stabilisasi sebelum SPRI. [ASUMSI dari pola IGD]
3. Dokter buka menu **Pelayanan → (RJ/IGD) → SPRI → Buat SPRI** dari konteks registrasi pasien aktif.
4. Sistem **autofill** identitas pasien (no_rm, nama, NIK, dll) dari registrasi/EMR.
5. Dokter isi data klinis: diagnosis, indikasi rawat inap, DPJP ranap, kelas (diinginkan & dijamin), **jenis kasus, jenis pelayanan, ruang perawatan, rencana tanggal ranap**, tingkat ketergantungan, kebutuhan khusus.
6. Sistem tampilkan **ketersediaan tempat tidur** per kelas/ruang (read-only) sebagai informasi. [ASUMSI]
7. **Gateway — Data Lengkap & Valid?** (analogi g-service-order-blood *'Data Lengkap?'*, g-service-internal-referral *'Data ... Valid?'*):
   - **Tidak** → tampil error validasi, dokter lengkapi.
   - **Ya** → SPRI dapat diterbitkan.
8. Dokter **Terbitkan SPRI** → status `Diterbitkan`; sistem catat audit log (pembuat, timestamp).
9. Data SPRI **diteruskan ke admisi/TPPRI** (muncul di antrian admisi ranap). [ASUMSI handoff antarunit, pola internal-referral]
10. **(Fase 2)** Data SPRI terstruktur **dikirim ke SATUSEHAT** (Encounter/ServiceRequest/Condition). [ASUMSI fase integrasi]
11. **Event akhir (modul ini)**: *SPRI berhasil diterbitkan & terkirim ke admisi*. Proses penempatan kamar & transfer (E11) di luar scope.
12. Bila keputusan berubah (mis. ternyata rujuk eksternal) → dokter **batalkan SPRI** dengan alasan; status `Dibatalkan`.
13. Modul Discharge (E13) membaca flag `SPRI ada?` otomatis.

## 7. Main Flow / Mindmap

### Skenario A — SPRI dari Rawat Jalan
```
[Start: Pasien selesai diperiksa di poli]
  → Dokter nilai perlu rawat inap
  → Buka menu SPRI (konteks registrasi RJ aktif)
  → Sistem autofill identitas pasien
  → Dokter isi: diagnosis, indikasi, DPJP, kelas (diinginkan/dijamin),
               jenis kasus, jenis pelayanan, ruang perawatan, rencana tgl ranap, kebutuhan khusus
  → Sistem tampilkan ketersediaan bed (read-only) [ASUMSI]
  → Gateway: Data lengkap & valid?
        Tidak → tampil error → lengkapi (loop)
        Ya   → Terbitkan SPRI
  → Status = Diterbitkan + audit log
  → Kirim ke admisi/TPPRI
  → [Fase 2] Kirim data ke SATUSEHAT [ASUMSI]
[End: SPRI terkirim ke admisi]
```

### Skenario B — SPRI dari IGD
```
[Start: Pasien gawat darurat di IGD]
  → Triase (E10) + stabilisasi [ASUMSI prasyarat]
  → Dokter jaga/spesialis nilai perlu rawat inap
  → Buka menu SPRI (konteks registrasi IGD aktif)
  → Sistem autofill identitas pasien
  → Dokter isi: diagnosis kerja/sementara, indikasi, jenis kasus, jenis pelayanan,
               ruang perawatan (mis. Isolasi/ICU), rencana tgl ranap,
               tingkat ketergantungan, preferensi kelas (hak/penjamin)
  → Sistem tampilkan ketersediaan bed (read-only) [ASUMSI]
  → Gateway: Data lengkap & valid?
        Tidak → error → lengkapi (loop)
        Ya   → Terbitkan SPRI (prioritas/cepat)
  → Status = Diterbitkan + audit log
  → Kirim ke admisi/TPPRI → siap transfer (E11)
  → [Fase 2] Kirim data ke SATUSEHAT [ASUMSI]
[End: SPRI terkirim, transfer IGD→ranap dapat dimulai]
```

### Skenario C — Batal/Ubah SPRI
```
[SPRI status Diterbitkan, belum diproses admisi]
  → Dokter Edit / Batalkan
  → Gateway: Sudah diproses admisi?
        Ya  → tidak bisa diubah (kunci) → koordinasi manual [PERLU KONFIRMASI]
        Tidak → simpan perubahan / set status Dibatalkan + alasan + audit log
[End]
```

## 8. Business Rules

- **BR-01**: SPRI hanya dapat diterbitkan oleh **dokter** (DPJP/dokter jaga/spesialis) yang memiliki hak akses pada unit RJ/IGD. (traceability: pool 'Dokter' g-service-*)
- **BR-02**: SPRI hanya dibuat dari **registrasi pasien aktif** di unit RJ atau IGD. Di luar kedua unit → menu tidak tersedia (Out Scope).
- **BR-03**: SPRI **tidak dapat diterbitkan** bila data wajib (diagnosis, indikasi, DPJP ranap, kelas dijamin, **jenis pelayanan, ruang perawatan, rencana tgl ranap**) belum lengkap. (gateway *Data Lengkap & Valid?*)
- **BR-04 (IGD)**: SPRI IGD sebaiknya dibuat setelah pasien **terstabilisasi & triase (E10)** terdokumentasi. [ASUMSI]
- **BR-05**: Sistem menampilkan **kelas dijamin** sesuai hak penjamin (BPJS/asuransi); bila kelas diinginkan > hak penjamin → tandai *naik kelas* (selisih biaya di luar scope billing). [PERLU KONFIRMASI aturan naik kelas]
- **BR-06**: Ketersediaan bed bersifat **informasi (read-only)**; SPRI tetap bisa terbit walau bed penuh (keputusan klinis), dengan flag `Menunggu Bed`. [ASUMSI]
- **BR-07**: SPRI yang **sudah diproses admisi** tidak boleh diedit/dibatalkan dokter unit asal (kunci); perubahan via koordinasi admisi. [PERLU KONFIRMASI]
- **BR-08**: Pembatalan SPRI **wajib mengisi alasan** dan tercatat di audit log (analogi 'Dokumentasi Alasan' g-service-discharge).
- **BR-09**: Setiap aksi (buat/ubah/terbit/batal) **wajib audit log**: user, timestamp, perubahan. (analogi 'Catat audit log' g-service-internal-referral)
- **BR-10**: Satu episode pelayanan aktif hanya boleh punya **satu SPRI aktif** (status Diterbitkan/Menunggu Bed). SPRI baru menggantikan setelah yang lama dibatalkan. [ASUMSI]
- **BR-11**: Status SPRI per pasien **dapat dibaca modul Discharge (E13)** untuk menjawab 'SPRI Sudah Ada?'.
- **BR-12**: **Ruang Perawatan** dipilih dari enum baku: NICU/PICU, Umum, ICU, ICCU, VK, Isolasi. Kebutuhan isolasi pasien direpresentasikan via pilihan ruang **Isolasi** (menggantikan field kebutuhan_isolasi terdahulu). [PERLU KONFIRMASI bila perlu detail tipe isolasi airborne/droplet/kontak]
- **BR-13**: **Jenis Pelayanan** dipilih dari enum: Preventif, Rehabilitatif, Kuratif, Paliatif — dirancang siap dipetakan ke kategori SATUSEHAT. [ASUMSI mapping]
- **BR-14**: **Rencana Tanggal Ranap** (tgl_ranap) tidak boleh sebelum tanggal penerbitan SPRI. [ASUMSI]

## 9. User Stories

- **US-001** — Sebagai **Dokter Spesialis/DPJP (RJ)**, saya ingin menerbitkan SPRI dari poli, agar pasien yang butuh rawat inap segera diproses admisi. (source: pola 'Buka form Tindak Lanjut' g-service-internal-referral)
- **US-002** — Sebagai **Dokter Jaga IGD**, saya ingin membuat SPRI cepat setelah stabilisasi, agar transfer IGD→ranap tidak tertunda. (source: pola IGD g-service-cpo-order flag URGENT)
- **US-003** — Sebagai **Dokter**, saya ingin sistem autofill identitas pasien, agar tidak menulis ulang & mengurangi salah catat. (source: autofill identitas registrasi)
- **US-004** — Sebagai **Dokter**, saya ingin melihat ketersediaan & kelas tempat tidur saat membuat SPRI, agar memilih kelas/ruang yang realistis. [ASUMSI]
- **US-005** — Sebagai **Dokter**, saya ingin sistem memvalidasi kelengkapan data sebelum terbit, agar SPRI tidak ditolak admisi. (source: gateway Data Lengkap?)
- **US-006** — Sebagai **Petugas Admisi/TPPRI**, saya ingin menerima SPRI elektronik beserta data klinis, jenis pelayanan, ruang perawatan & preferensi kelas, agar penempatan kamar cepat & sesuai. (source: handoff antarunit)
- **US-007** — Sebagai **Dokter**, saya ingin membatalkan/mengubah SPRI dengan alasan sebelum diproses admisi, agar perubahan keputusan medis terdokumentasi. (source: 'Dokumentasi Alasan' g-service-discharge)
- **US-008** — Sebagai **Petugas/Manajemen**, saya ingin memonitor daftar & status SPRI per unit, agar tahu antrian pasien menunggu ranap.
- **US-009** — Sebagai **Dokter modul Discharge**, saya ingin sistem tahu otomatis apakah SPRI sudah ada, agar keputusan discharge/alih rawat akurat. (source: keputusan 'SPRI Sudah Ada?' g-service-discharge)
- **US-010** — Sebagai **Petugas**, saya ingin mencetak SPRI (PDF), agar tersedia arsip fisik untuk penjamin/keluarga.
- **US-011** — Sebagai **Dokter**, saya ingin mengisi jenis kasus, jenis pelayanan, ruang perawatan & rencana tanggal ranap, agar admisi & penjamin punya konteks lengkap dan data siap dikirim ke SATUSEHAT. (source: instruksi pengembangan)
- **US-012** — Sebagai **Tim Integrasi/Manajemen**, saya ingin data SPRI terstruktur & ber-kode, agar ke depan dapat dikirim ke SATUSEHAT tanpa pengisian ulang. [ASUMSI fase 2]

## 10. Functional Requirements

| ID | Requirement | Traceability |
|----|-------------|--------------|
| **FR-001** | Sistem menyediakan menu SPRI pada unit RJ & IGD, hanya dari registrasi pasien aktif. | BR-02, US-001/002 |
| **FR-002** | Sistem autofill data identitas pasien (no_rm, nama, NIK, jenis_kelamin, tgl_lahir, no_bpjs, penjamin) dari registrasi/EMR. | US-003 |
| **FR-003** | Sistem menyediakan form input data klinis SPRI (diagnosis, indikasi, DPJP ranap, kelas, jenis kasus, jenis pelayanan, ruang perawatan, rencana tgl ranap, tingkat ketergantungan, kebutuhan khusus). | US-001/002/011, layar di Data Req §11.A |
| **FR-004** | Sistem menampilkan informasi ketersediaan & kapasitas tempat tidur per kelas/ruang (read-only). [ASUMSI sumber master bed] | US-004, BR-06 |
| **FR-005** | Sistem memvalidasi kelengkapan & format data wajib sebelum penerbitan; tampilkan pesan error spesifik bila gagal. | BR-03, US-005, gateway Data Lengkap? |
| **FR-006** | Sistem menampilkan kelas dijamin sesuai hak penjamin & menandai naik kelas bila kelas diinginkan lebih tinggi. | BR-05 |
| **FR-007** | Sistem menerbitkan SPRI → set status `Diterbitkan`/`Menunggu Bed` & generate no_spri unik. | US-001/002 |
| **FR-008** | Sistem meneruskan SPRI ke antrian admisi/TPPRI. | US-006 |
| **FR-009** | Sistem menyediakan daftar SPRI per unit dengan filter status/tanggal/pasien/ruang (dashboard). | US-008 |
| **FR-010** | Sistem mendukung edit & pembatalan SPRI (wajib alasan) selama belum diproses admisi; kunci bila sudah diproses. | BR-07, BR-08, US-007 |
| **FR-011** | Sistem mencatat audit log setiap aksi (user, timestamp, perubahan). | BR-09, US-007 |
| **FR-012** | Sistem mengekspos flag status SPRI per pasien untuk dikonsumsi modul Discharge (E13). | BR-11, US-009 |
| **FR-013** | Sistem mencetak SPRI ke PDF dengan kop RS, data pasien, klinis, jenis pelayanan, ruang perawatan, rencana tgl ranap, DPJP, tanda tangan dokter. | US-010 |
| **FR-014** | Sistem mencegah lebih dari satu SPRI aktif per episode pelayanan. | BR-10 |
| **FR-015** | Sistem mengirim notifikasi/indikator ke unit admisi saat SPRI baru terbit. [ASUMSI] | US-006 |
| **FR-016** | Sistem menyediakan enum baku Jenis Pelayanan (Preventif/Rehabilitatif/Kuratif/Paliatif) & Ruang Perawatan (NICU/PICU, Umum, ICU, ICCU, VK, Isolasi) dan menyimpannya ter-kode. | BR-12, BR-13, US-011 |
| **FR-017** | Sistem menyiapkan & memetakan field SPRI (diagnosis ICD-10, jenis pelayanan, ruang) ke payload SATUSEHAT untuk pengiriman pada fase integrasi. [ASUMSI — Fase 2] | US-012, §13 |

## 11. Data Requirements (Spesifikasi Field)

Field identitas pasien mengikuti **kamus kanonik lintas-PRD** (konsisten dgn modul Pendaftaran/Staff). Tidak membuat definisi tandingan.

> Perubahan v1.1: **+** tgl_ranap, jenis_kasus, jenis_pelayanan, ruang_perawatan. **−** kebutuhan_isolasi (digantikan opsi ruang_perawatan = *Isolasi*).

### 11.A Layar INPUT — Form Buat/Edit SPRI (FR-003)

| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_spri | No. SPRI | text | Ya | unik, auto | auto-generate | dibuat saat terbit (FR-007) |
| no_rm | No. RM | text | Ya | format RM RS | autofill registrasi | kanonik |
| nama | Nama Lengkap | text | Ya | maks 100 char | autofill registrasi | kanonik |
| nik | NIK | text | Ya | 16 digit, valid Disdukcapil | autofill registrasi | kanonik |
| jenis_kelamin | Jenis Kelamin | dropdown | Ya | L / P | autofill registrasi | kanonik |
| tgl_lahir | Tanggal Lahir | date | Ya | <= hari ini | autofill registrasi | kanonik |
| no_bpjs | No. Kartu BPJS | text | Tidak | 13 digit | autofill / VClaim | wajib bila penjamin BPJS |
| unit_asal | Unit Asal | dropdown | Ya | enum: Rawat Jalan / IGD | auto dari konteks | kanonik `unit` (lookup A3) |
| poli_asal | Poli/Ruang Asal | dropdown(lookup) | Ya | master unit | lookup | hanya bila RJ |
| jenis_penjamin | Jenis Penjamin | dropdown | Ya | enum: Umum/BPJS/Asuransi | autofill registrasi | konsisten Penjamin & SEP |
| dokter_pembuat | Dokter Pembuat | lookup | Ya | dari master Staff (dokter aktif) | autofill user login | hak akses BR-01 |
| dpjp_ranap | DPJP Rawat Inap | lookup | Ya | dari master Staff (dokter) | manual | dasar awal E16 |
| diagnosis_kerja | Diagnosis (Kerja/Sementara) | text | Ya | maks 255 char | manual | IGD: diagnosis kerja |
| kode_diagnosis | Kode Diagnosis (ICD-10) | lookup | Tidak | format ICD-10 | master ICD-10 | mapping SATUSEHAT (Condition) [ASUMSI] |
| indikasi_ranap | Indikasi Rawat Inap | textarea | Ya | maks 500 char | manual | alasan medis |
| jenis_kasus | Jenis Kasus | dropdown | Ya | enum [PERLU KONFIRMASI nilai: mis. Bedah/Non-Bedah/Kebidanan/Anak] | manual | **baru v1.1** |
| jenis_pelayanan | Jenis Pelayanan | dropdown | Ya | enum: Preventif / Rehabilitatif / Kuratif / Paliatif | manual | **baru v1.1**; siap map SATUSEHAT (BR-13) |
| ruang_perawatan | Ruang Perawatan | dropdown | Ya | enum: NICU/PICU, Umum, ICU, ICCU, VK, Isolasi | lookup master ruang | **baru v1.1**; opsi *Isolasi* gantikan kebutuhan_isolasi (BR-12) |
| kelas_dijamin | Kelas Dijamin | dropdown | Ya | enum kelas, sesuai hak penjamin | integrasi BPJS / aturan penjamin | BR-05/06 |
| tgl_ranap | Rencana Tanggal Rawat Inap | date | Ya | >= tgl penerbitan SPRI | manual / default hari ini | **baru v1.1** (BR-14) |
| tgl_terbit | Tanggal/Jam Terbit | datetime | Ya | auto saat terbit | auto-generate | audit |
| alasan_batal | Alasan Pembatalan | textarea | Kondisional | wajib saat membatalkan, maks 255 | manual | BR-08, FR-010 |

> **Dihapus**: ~~kebutuhan_isolasi~~ (enum Tidak/Airborne/Droplet/Kontak) — kebutuhan isolasi kini diwakili `ruang_perawatan = Isolasi`. Bila RS butuh detail tipe isolasi, tambahkan sub-field terpisah. [PERLU KONFIRMASI]

### 11.B Layar TAMPIL — Dashboard/List SPRI per Unit (FR-009)

| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. SPRI | spri.no_spri | text | sort | |
| Nama Pasien | spri.nama | text | cari | |
| Unit Asal | spri.unit_asal | badge (RJ/IGD) | filter | |
| Jenis Pelayanan | spri.jenis_pelayanan | badge | filter | baru v1.1 |
| Ruang Perawatan | spri.ruang_perawatan | badge | filter | baru v1.1 |
| Kelas Dijamin | spri.kelas_dijamin | text | filter | |
| Rencana Tgl Ranap | spri.tgl_ranap | tanggal | sort | baru v1.1 |
| Status | spri.status | badge (Diterbitkan/Menunggu Bed/Dibatalkan/Diproses) | filter | |
| DPJP Ranap | spri.dpjp_ranap | text | filter | |
| Status SATUSEHAT | spri.satusehat_status | badge (Belum/Terkirim/Gagal) | filter | Fase 2 [ASUMSI] |

## 12. Non-Functional Requirements

- **NFR-001 (Performa)**: Form SPRI tampil < 3 detik; panel ketersediaan bed refresh < 5 detik. (konteks internet tidak stabil RS Tipe C&D)
- **NFR-002 (Ketersediaan/Offline)**: Karena IGD kritikal & internet bisa putus, form SPRI dapat diisi & disimpan lokal lalu sinkron saat koneksi pulih. [ASUMSI — perlu validasi feasibility] [PERLU KONFIRMASI]
- **NFR-003 (Keamanan & Akses)**: Hanya role dokter berhak buat/terbit SPRI (BR-01); data klinis terenkripsi saat transit; sesuai RME & kerahasiaan rekam medis.
- **NFR-004 (Auditability)**: Semua aksi tercatat (user, timestamp, before/after) & tak dapat dihapus. (FR-011)
- **NFR-005 (Usability)**: Form ringkas, autofill maksimal, validasi inline — sesuai SDM IT/klinis terbatas RS Tipe C&D.
- **NFR-006 (Interoperabilitas)**: Diagnosis pakai ICD-10; jenis pelayanan & ruang perawatan disimpan ter-kode; **siap dipetakan & dikirim ke SATUSEHAT** (Encounter/ServiceRequest/Condition) saat fase integrasi. [ASUMSI]
- **NFR-007 (Cetak)**: SPRI PDF mengikuti format dokumen RS, dapat dicetak printer standar.
- **NFR-008 (Skalabilitas)**: Dukung beban tipikal RS Tipe C&D (puluhan SPRI/hari) tanpa degradasi. [ASUMSI volume]
- **NFR-009 (Keandalan integrasi SATUSEHAT — Fase 2)**: Pengiriman ke SATUSEHAT bersifat async + retry; kegagalan kirim tidak menghambat penerbitan SPRI/alur admisi; status kirim tercatat (Belum/Terkirim/Gagal). [ASUMSI]

## 13. Integrasi Eksternal

| Integrasi | Arah | Tujuan | Status |
|-----------|------|--------|--------|
| **Registrasi / EMR (internal)** | Konsumsi | Autofill identitas & penjamin pasien aktif | Wajib (FR-002) |
| **Modul Admisi Rawat Inap / TPPRI (internal)** | Kirim | Teruskan SPRI ke antrian admisi | Wajib (FR-008) |
| **Master Bed / Ruang (internal)** | Konsumsi | Tampil ketersediaan & kelas bed; lookup ruang_perawatan | Wajib (FR-004) [ASUMSI sumber data] |
| **Modul Discharge E13 (internal)** | Ekspos | Jawab keputusan 'SPRI Sudah Ada?' | Wajib (FR-012) |
| **Master Staff (internal)** | Konsumsi | Lookup dokter pembuat & DPJP | Wajib |
| **BPJS (VClaim)** | Konsumsi | Validasi hak kelas & status kartu utk kelas_dijamin | [PERLU KONFIRMASI — apakah cek di SPRI atau saat SEP ranap] |
| **SATUSEHAT** | **Kirim** | **Kirim data SPRI ke SATUSEHAT** — Encounter (rawat inap), ServiceRequest/perintah ranap, Condition (diagnosis ICD-10); jenis_pelayanan & ruang_perawatan dipetakan ke terminologi terkait | **Fase 2 (rencana)** [ASUMSI mapping & timeline] |
| **Disdukcapil (NIK)** | Konsumsi | Sudah tervalidasi di registrasi (tidak ulang di SPRI) | Tidak langsung |
| **INA-CBG** | – | Tidak di SPRI; relevan di billing/klaim ranap | Out Scope |

**Catatan SATUSEHAT (penting)**: Ke depan **data SPRI akan dikirim ke SATUSEHAT** sebagai bagian kepatuhan RME nasional. Pada modul ini (MVP) yang dikerjakan = **menyiapkan struktur data ter-kode** (ICD-10, enum jenis_pelayanan, enum ruang_perawatan, identitas pasien kanonik) agar siap dipetakan ke resource FHIR SATUSEHAT. Pengiriman payload aktual + handling token/consent/IHS = **Fase 2** dan perlu disepakati (lihat FR-017, NFR-006, NFR-009). [PERLU KONFIRMASI cakupan & waktu fase 2]

Catatan: SEP rawat inap & klaim BPJS **bukan** tanggung jawab modul SPRI (Out Scope); SPRI hanya membaca data penjamin & hak kelas.

## Asumsi
- Modul E20 tidak punya BPMN sendiri; alur As-Is/To-Be diturunkan dari analogi BPMN cluster Pelayanan utama (g-service-discharge, g-service-internal-referral, g-service-internal-consult, g-service-cpo-order).
- Keputusan 'SPRI Sudah Ada?' pada g-service-discharge dijawab oleh flag status SPRI modul ini.
- Di IGD, SPRI dibuat setelah Triase (E10) & stabilisasi pasien.
- Ketersediaan tempat tidur disediakan modul master bed/ruang internal dan ditampilkan read-only di SPRI.
- SPRI bisa terbit walau bed penuh dengan status 'Menunggu Bed' (keputusan klinis).
- Satu episode pelayanan aktif hanya punya satu SPRI aktif.
- Identitas pasien sudah tervalidasi (NIK/Disdukcapil) saat registrasi, tidak divalidasi ulang di SPRI.
- Volume tipikal RS Tipe C&D: puluhan SPRI per hari.
- Field kebutuhan_isolasi dihapus; kebutuhan isolasi diwakili oleh opsi ruang_perawatan = 'Isolasi'.
- Field baru tgl_ranap, jenis_kasus, jenis_pelayanan, ruang_perawatan ditambahkan per instruksi pengembangan v1.1.
- Jenis Pelayanan enum: Preventif, Rehabilitatif, Kuratif, Paliatif. Ruang Perawatan enum: NICU/PICU, Umum, ICU, ICCU, VK, Isolasi.
- Data SPRI dirancang siap dikirim ke SATUSEHAT (Encounter/ServiceRequest/Condition); pengiriman payload aktual = fase integrasi lanjutan (Fase 2).

## Pertanyaan Terbuka
- Nilai enum 'Jenis Kasus' (jenis_kasus) belum baku — perlu daftar resmi RS (mis. Bedah/Non-Bedah/Kebidanan/Anak/Lainnya). [PERLU KONFIRMASI]
- Apakah opsi ruang 'Isolasi' cukup, atau masih perlu sub-field tipe isolasi (Airborne/Droplet/Kontak) terpisah setelah penghapusan kebutuhan_isolasi?
- Mapping resmi 'Jenis Pelayanan' (Preventif/Rehabilitatif/Kuratif/Paliatif) & 'Ruang Perawatan' ke kode/terminologi SATUSEHAT — pakai value set apa?
- Lingkup & timeline Fase 2 pengiriman SATUSEHAT (resource apa saja: Encounter/ServiceRequest/Condition; trigger kirim saat terbit atau saat admisi terima?).
- Apakah validasi hak kelas/keaktifan kartu BPJS (VClaim) dilakukan saat penerbitan SPRI atau ditunda ke proses SEP ranap di admisi?
- Aturan naik kelas (selisih biaya, persetujuan pasien) — bagaimana ditangani saat SPRI? [BR-05]
- Apakah SPRI yang sudah diproses admisi benar-benar dikunci dari edit dokter, atau ada mekanisme revisi terkoordinasi? [BR-07]
- Apakah panel ketersediaan tempat tidur sudah ada modul master bed real-time, atau perlu dibangun/diintegrasikan?
- Perlukah mode offline untuk IGD (NFR-002), dan apa risiko sinkronisasi data klinis?
- Target waktu admisi & kesesuaian kelas (Goals) perlu disepakati manajemen RS.
- Apakah SPRI perlu tanda tangan elektronik dokter (e-sign) untuk keabsahan dokumen & kebutuhan SATUSEHAT?