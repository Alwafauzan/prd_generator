# PRD — Asesmen Jawaban Konsulan

*Konsul / Rujukan Internal · Modul Asesmen Rawat Jalan · Neurovi SIMRS v2*

**Related Document:** PRD Order Konsul/Rujukan Internal — sisi pengirim (hard dependency); **PRD Asesmen Rawat Jalan — form asesmen per poli, target routing untuk order Rujukan Internal (hard dependency)**; PRD Riwayat — panel kanan + rantai rujuk (hard dependency); PRD Discharge — status pulang rujuk internal + guard anti-loop (hard dependency); PRD Asesmen (konvensi edit casemix); Modul Registrasi; Modul E-Klaim; Modul Billing / Input Tindakan & BHP; Referensi V1/SIMRS lama. **Referensi Desain:** Screenshot "Konsulan Klinik Mata" (2 gambar).
**Dokumen ID:** PRD Asesmen Jawaban Konsulan *(ref internal: PRD-P-JWK-RJ)*  ·  **Versi:** 1.7 (Draft — tambah field Rekomendasi Tindak Lanjut Konsul, dokumentasi klinis non-mengikat)
**Modul:** Asesmen Rawat Jalan · **Cluster:** Pelayanan Rawat Jalan
**Tanggal Disusun:** 2 Juli 2026 · **Penyusun:** Tim Product — Tamtech International
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]` (tidak dicantumkan di sumber)
**Status:** Final Draft — v1.6 (routing mengikuti tipe order; siap review approval) · **Target Release:** `[PERLU KONFIRMASI]` (tidak dicantumkan di sumber)
**Perubahan v1.7:** Pada posisi field "Update Status DPJP" yang dihapus (v1.6), **ditambahkan field "Rekomendasi Tindak Lanjut Konsul"** di bagian Jawaban Konsul — template/pilihan bagi dokter penerima untuk mendokumentasikan kesimpulan: **cukup Konsul Internal (selesai)** atau **disarankan Rujuk Internal (perlu kontrol 1× lagi / alih DPJP)**. Field ini **bersifat dokumentasi klinis non-mengikat** — **tidak** mengubah DPJP, **tidak** memicu registrasi/routing apa pun. Fungsinya membantu **DPJP pengirim** menentukan *next action*: bila disarankan rujuk, episode konsul tetap **selesai 1×** (terminal), lalu pasien diarahkan kembali ke DPJP pengirim untuk membuat **order rujuk internal** ke poli konsulan terakhir — perpindahan wewenang DPJP tetap terjadi hanya melalui order rujuk (BR-03). Lihat FR-11, BR-09.
**Perubahan v1.6:** **Field "Update Status DPJP" dihapus.** Status **tidak dipilih manual** oleh penerima; **mengikuti tipe order** poli asal. **Order Konsul Internal** → tampil **Form Jawaban Konsul** (modul ini), DPJP tetap perujuk. **Order Rujukan Internal** → DPJP berpindah → tampil **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)**, *bukan* form ini. Supersede OQ-02.

---

## 1. Overview / Brief Summary

Modul **Asesmen Jawaban Konsulan** menyediakan form terstruktur bagi **dokter poli penerima** untuk membalas permintaan **konsul internal** pada pelayanan rawat jalan. Dalam praktiknya, seorang DPJP (Dokter Penanggung Jawab Pelayanan) kerap membutuhkan pendapat atau penanganan dari poli lain untuk satu episode kunjungan pasien — misalnya pasien Klinik Jantung yang dikonsulkan ke Klinik Mata untuk keluhan katarak. Proses ini terdiri dari dua sisi: **sisi pengirim** (order konsul/rujukan internal — *di luar cakupan PRD ini, menjadi dependensi*) dan **sisi penerima** (jawaban konsul — **cakupan PRD ini**).

Pada Neurovi v1/SIMRS lama, jawaban konsul umumnya berupa **teks bebas tanpa struktur** diagnosa/tindakan berkode dan tanpa panel riwayat kunjungan pengirim yang terintegrasi, sehingga dokter penerima kurang memiliki konteks dan hasil sulit dipakai ulang untuk klaim maupun kesinambungan perawatan. Neurovi v2 menstandardisasi jawaban konsul menjadi **form terstruktur berdampingan dengan panel riwayat kunjungan pengirim** (SOAP + penunjang).

**Perubahan model v1.6 — routing mengikuti tipe order (tanpa pilihan manual).** Status DPJP **tidak lagi dipilih** oleh dokter penerima; **ditentukan otomatis oleh tipe order** yang dibuat poli asal:
- **Order Konsul Internal** → sistem menampilkan **Form Jawaban Konsul** (modul ini). Pasien tetap menjadi **hak/tanggung jawab DPJP perujuk**; encounter/registrasi tetap sama.
- **Order Rujukan Internal** → **DPJP berpindah** ke poli penerima → sistem menampilkan **Form Asesmen sesuai poli** (PRD Asesmen Rawat Jalan), **bukan** Form Jawaban Konsul. Order rujuk memicu **discharge rujuk** + registrasi baru via flow asesmen/registrasi.

**Tambahan v1.7 — Rekomendasi Tindak Lanjut Konsul (dokumentasi klinis, non-mengikat).** Pada bagian Jawaban Konsul, dokter penerima dapat mendokumentasikan **kesimpulan hasil konsul**: apakah **cukup Konsul Internal (selesai)** atau **disarankan Rujuk Internal (perlu kontrol 1× lagi / alih DPJP)**. Rekomendasi ini **tidak mengubah** status DPJP, **tidak** memicu routing/registrasi — murni **catatan** untuk membantu **DPJP pengirim** menentukan tindak lanjut. Bila disarankan rujuk, episode konsul tetap **selesai 1×** (terminal), lalu pasien diarahkan kembali ke DPJP pengirim untuk membuat **order rujuk internal** ke poli konsulan terakhir; perpindahan wewenang DPJP terjadi **hanya** melalui order rujuk tersebut (BR-03, BR-09).

Karena itu, **cakupan form ini terbatas pada order Konsul Internal**. Diagnosa & Tindakan saat ini **teks bebas** — pemetaan ke ICD-10/ICD-9-CM ditandai sebagai roadmap `[**]`.

> Referensi: Screenshot desain "Konsulan Klinik Mata" (2 gambar); konvensi checkpoint tri-state modul Asesmen; PRD Asesmen Rawat Jalan, PRD Riwayat, PRD Discharge, PRD Order Konsul (dependensi).

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1)** — sumber: §1 Latar Belakang:
- Jawaban konsul umumnya berupa **teks bebas** tanpa struktur diagnosa/tindakan berkode.
- Tidak ada **panel riwayat kunjungan pengirim** yang terintegrasi di layar jawaban konsul.
- Akibatnya dokter penerima kurang memiliki konteks klinis, dan hasil jawaban sulit dipakai ulang untuk **e-klaim** maupun **kesinambungan perawatan**.

**Masalah/pain point:**
- Aspek bisnis proses: status DPJP (konsul vs rujukan internal) tidak eksplisit → tanggung jawab pelayanan pasien bisa tidak jelas/ganda. **v1.6:** kejelasan ini dijamin dari **tipe order**, bukan dari pilihan manual yang berpotensi keliru.
- Aspek UX: dokter penerima harus mencari konteks klinis pengirim secara manual, terpisah dari layar jawaban.
- Aspek logic system: output jawaban tidak terstruktur → tidak siap untuk e-klaim dan pemakaian ulang data.

**Dampak utama yang disasar v2:**
- Jawaban konsul terstandardisasi (jawaban, diagnosa, tindakan, hasil penunjang) dalam satu layar bersama konteks klinis pengirim.
- Status/tanggung jawab DPJP jelas **mengikuti tipe order** (Konsul vs Rujukan Internal) — form yang ditampilkan pun otomatis sesuai.

**Cakupan rilis:**
- PRD ini mencakup **sisi penerima untuk order Konsul Internal** (Form Jawaban Konsul). Sisi pengirim (order konsul/rujukan) berada di **PRD terpisah** (dependensi). **Order Rujukan Internal** dilayani **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)** — di luar form ini.
- Pengkodean **ICD-10 (diagnosa) & ICD-9-CM (tindakan)** saat ini teks bebas; pemetaan ke master ICD dinyatakan sebagai **roadmap** `[**]` (menyusul bila dibutuhkan untuk casemix/klaim).

## 3. Definisi & Istilah

> Preservasi §3 sumber. Pertahankan istilah domain apa adanya.

| Istilah | Definisi |
|---------|----------|
| **Konsul Internal** | Permintaan pendapat/penanganan ke poli lain **tanpa** memindahkan DPJP. Pasien tetap di bawah tanggung jawab poli/dokter pengirim. |
| **Rujukan Internal** | Perpindahan tanggung jawab pelayanan (**DPJP berpindah**) dari poli asal ke poli penerima dalam satu fasilitas. |
| **Poli Asal / Pengirim** | Poli yang membuat permintaan konsul (contoh: Klinik Jantung). |
| **Poli Tujuan / Penerima** | Poli yang membalas konsul / menangani rujukan (contoh: Klinik Mata). |
| **DPJP** | Dokter Penanggung Jawab Pelayanan. |
| **SOAP** | Struktur asesmen: Subjektif, Objektif, Asesmen, Planning. |
| **I-CARE BPJS** | Layanan riwayat pelayanan kesehatan peserta JKN dari BPJS Kesehatan. |
| **Form Jawaban Konsul** | Form pada modul ini; ditampilkan untuk order **Konsul Internal**. |
| **Form Asesmen sesuai poli** | Form asesmen rawat jalan standar milik poli penerima (PRD Asesmen Rawat Jalan); ditampilkan untuk order **Rujukan Internal**. |

## 4. In Scope

### Scope Definition (Cakupan PRD ini — order Konsul Internal)
1. **Panel kiri — Form Jawaban Konsul:** Riwayat Konsulan Poli Asal (read-only), Jawaban Konsulan, Diagnosa Konsulan, Tindakan yang Diberikan, Hasil Pemeriksaan Penunjang. **`[v1.6]` Field "Update Status DPJP" DIHAPUS** — status mengikuti tipe order, bukan pilihan.
2. **Panel kanan (referensi, high-level):** menampilkan **Riwayat Kunjungan Pengirim** sebagai konteks + kebutuhan spesifik Jawaban Konsulan (default pengirim, konten copyable). *Detail item data → PRD Riwayat.*
3. **Aksi:** Simpan Perubahan, Print Hasil Konsulan, tarik data I-CARE BPJS, Kembali.
4. **Status/state konsul** dari sisi penerima (Menunggu → Sedang Diproses → Selesai Dijawab).
5. **`[v1.6]` Routing otomatis:** sistem menampilkan **Form Jawaban Konsul hanya untuk order Konsul Internal** (lihat FR-03, BR-03).

### Out Scope
- **`[v1.6]` Order Rujukan Internal** → dilayani **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)**, **bukan** form ini, karena DPJP berpindah. Form ini tidak menampilkan/menangani jawaban rujuk.
- **`[v1.6]` Pemilihan status DPJP manual** (field "Update Status DPJP" dihapus — status mengikuti tipe order).
- Pembuatan **order konsul/rujukan internal** di sisi pengirim (dependensi — PRD terpisah).
- **Detail item data & spesifikasi panel Riwayat Kunjungan Pengirim** (isi tiap tab, struktur SOAP, penunjang, sumber per field) — dicakup **PRD Riwayat terpisah** (termasuk **visibilitas rantai rujuk** di tab Riwayat rujukan).
- **Detail status pulang / discharge rujuk internal & kebijakan guard anti-loop** rantai rujuk — dicakup **PRD Discharge terpisah**. PRD ini hanya **memicu** outcome discharge-rujuk untuk order rujuk (via routing ke asesmen/registrasi).
- Manajemen antrean/registrasi ulang di poli penerima (dibahas hanya sebagai dampak alur, bukan mekanisme).
- Master Data ICD-10 & ICD-9-CM (mengonsumsi master yang sudah ada).
- Alur klaim BPJS end-to-end.

## 5. Goals and Metrics

### Tujuan Produk
- Menyediakan **form terstruktur** bagi dokter poli penerima untuk membalas **konsul internal** dalam satu layar bersama konteks klinis pengirim.
- Menstandardisasi output jawaban konsul (jawaban, diagnosa, tindakan, hasil penunjang) agar terdokumentasi rapi dan siap dipakai untuk **e-klaim** serta kesinambungan perawatan. *(Diagnosa & tindakan saat ini teks bebas; pengkodean ICD menyusul sesuai roadmap.)*
- **`[v1.6]`** Menjamin tanggung jawab DPJP jelas dengan **menentukan form otomatis dari tipe order** (Konsul → Form Jawaban Konsul; Rujukan → Form Asesmen poli), tanpa pilihan manual yang rawan keliru.

### Metrik Keberhasilan (usulan)
| Metrik | Target | Sumber |
|--------|--------|--------|
| Kelengkapan struktur jawaban | 100% jawaban konsul memiliki minimal 1 diagnosa & 1 tindakan terisi. | BR-01, BR-02 |
| Ketepatan waktu jawaban | ≥ 90% konsul mendapat jawaban dalam SLA yang disepakati (mis. saat sesi poli yang sama). | Metrik operasional |
| Kejelasan DPJP | 0 kasus DPJP ganda/tidak jelas akibat rujukan internal tidak tercatat. | BR-03, BR-08 |

## 6. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran terhadap Modul |
|-------|-----------------------|
| **PRD Order Konsul/Rujukan (sisi pengirim)** | Event source — menyediakan **tipe order** (Konsul/Rujukan Internal), badge tipe, asal poli, diagnosa poli asal, alasan rujukan (hard dependency). **Tipe order menentukan routing form (v1.6).** |
| **`[v1.6]` PRD Asesmen Rawat Jalan** | **Target routing untuk order Rujukan Internal** — Form Asesmen sesuai poli ditampilkan alih-alih Form Jawaban Konsul karena DPJP berpindah (hard dependency). |
| **PRD Riwayat** | Mengatur detail panel Riwayat Kunjungan Pengirim (item data, tab, SOAP, penunjang) & visibilitas rantai rujuk (hard dependency). |
| **PRD Discharge** | Mengatur detail status pulang / discharge rujuk internal & kebijakan guard anti-loop rantai rujuk (hard dependency). |
| **Modul Registrasi** | Order Rujukan Internal memicu registrasi baru (discharge rujuk); tiap hop rantai = registrasi baru dengan tautan ke rujuk induk. |
| **Modul E-Klaim** | Diagnosa masuk e-klaim via preview dokumen asesmen (tidak diklaim terpisah) — BR-07. |
| **Modul Billing / Input Tindakan & BHP** | Tindakan & BHP yang billable masuk billing melalui mekanisme Input Tindakan & BHP — BR-07. |
| **I-CARE BPJS** | Preview riwayat pelayanan peserta JKN (dokter-only, butuh kode dokter). |
| **Master Pasien / Registrasi Kunjungan** | Sumber Header Pasien (identitas read-only). |

Dependency lintas modul (hard): **PRD Order Konsul**, **PRD Asesmen Rawat Jalan**, **PRD Riwayat**, **PRD Discharge**, **Modul Registrasi**.

### B. Aktor & Persona (RBAC)
| Aktor / Persona | Tipe | Hak Akses / Peran terhadap Modul |
|-----------------|------|----------------------------------|
| **Dokter Poli Penerima** | Primary | **Satu-satunya** yang mengisi & memfinalisasi (Simpan) jawaban konsul. Setelah tersimpan **dapat mengedit**. Lihat riwayat pengirim, akses **I-CARE BPJS (dokter-only)**, cetak hasil. |
| **Casemix** | Secondary | **Dapat mengedit** jawaban/asesmen yang sudah tersimpan untuk kebutuhan klaim (mengikuti konvensi PRD Asesmen). **Tidak** mengisi/finalisasi awal. |
| **Perawat Poli Penerima** | Secondary | **Lihat saja** (read-only) konteks & jawaban. Tidak mengisi/final/edit. |
| **Dokter Poli Pengirim** | Secondary | Lihat jawaban konsul (read-only) setelah tersimpan. |
| **Admin/Supervisor** | Tersier | Lihat seluruh jawaban konsul untuk audit. |

> **Ringkasan kontrol akses:** Isi & finalisasi awal → **hanya dokter** poli penerima (OQ-12). Edit setelah tersimpan → **dokter + casemix** (casemix untuk kebutuhan klaim, sesuai PRD Asesmen — OQ-07). Preview I-CARE BPJS hanya dapat diakses dokter (OQ-09). Setiap edit tercatat di audit trail.

## 7. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
Jawaban konsul umumnya teks bebas tanpa struktur diagnosa/tindakan berkode dan tanpa panel riwayat kunjungan pengirim yang terintegrasi. Dokter penerima kurang memiliki konteks; hasil sulit dipakai ulang untuk klaim maupun kesinambungan perawatan.

### B. To-Be (Neurovi v2 — v1.6)
1. Poli asal membuat **order Konsul/Rujukan Internal** → order masuk antrean poli tujuan. *(Sisi pengirim — dependensi, di luar PRD ini.)*
2. Poli penerima membuka item antrean **"Konsulan Klinik <Tujuan>"**.
3. **Sistem menentukan form otomatis berdasarkan tipe order (tanpa pilihan manual):**
   - **Order Konsul Internal** → tampil **Form Jawaban Konsul** (modul ini). DPJP tetap perujuk; encounter/registrasi **sama**.
   - **Order Rujukan Internal** → tampil **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)**. DPJP **berpindah**; memicu **discharge rujuk** + **registrasi baru** (modul Registrasi).
4. *(Jalur Konsul — modul ini)* Tinjau **Riwayat Konsulan Poli Asal** (kiri) + **Riwayat Kunjungan Pengirim** (kanan).
5. Isi **Jawaban Konsulan** + **Diagnosa Konsulan** + **Tindakan yang Diberikan** (+ Penunjang opsional).
6. **Simpan Perubahan** → status konsul = *Selesai Dijawab*; jawaban dikembalikan ke DPJP asal.
7. (Opsional) **Print Hasil Konsulan**. Edit pasca-simpan → hanya oleh **dokter + casemix**.

### C. Perbedaan v1.5 → v1.6
| Aspek | v1.5 | v1.6 |
|-------|------|------|
| Status DPJP | Radio **Update Status DPJP** dipilih penerima (default dari order, dapat diubah). | **Dihapus** — status **mengikuti tipe order** (tidak dapat diubah). |
| Form untuk order Rujukan Internal | Jawaban rujuk diisi pada **form yang sama** (branch discharge rujuk). | Dialihkan ke **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)** — di luar form ini. |
| Cakupan form ini | Konsul **dan** rujuk. | **Hanya order Konsul Internal.** |

## 8. Main Flow / Mindmap

### Diagram alur high-level (v1.6 — routing by tipe order)
```
[Poli Asal] Buat Order Konsul / Rujukan Internal --> masuk antrean poli tujuan
    |
[Poli Penerima] Buka item antrean "Konsulan Klinik <Tujuan>"
    |
Sistem tentukan form OTOMATIS dari TIPE ORDER (tanpa pilihan manual):
    |
    +-- Order = KONSUL INTERNAL --> Tampilkan FORM JAWABAN KONSUL (modul ini)
    |        DPJP tetap (perujuk); encounter/registrasi SAMA
    |        Tinjau Riwayat Poli Asal (kiri) + Riwayat Kunjungan Pengirim (kanan)
    |        Isi Jawaban Konsulan* + Diagnosa* + Tindakan* (+ Penunjang opsional)
    |        [Simpan] --> status = Selesai Dijawab; jawaban ke DPJP asal
    |        (Opsional) [Print Hasil Konsulan]; edit pasca-simpan = dokter + casemix
    |
    +-- Order = RUJUKAN INTERNAL --> Tampilkan FORM ASESMEN SESUAI POLI
             (PRD Asesmen Rawat Jalan, BUKAN form ini)
             DPJP BERPINDAH ke poli penerima
             "DISCHARGE RUJUK" + REGISTRASI BARU (modul Registrasi)
             Rantai rujuk via order+registrasi (tautan parent)
```

### Skenario 1 — Order Konsul Internal (alur normal, modul ini)
Sistem menampilkan Form Jawaban Konsul. Dokter penerima menjawab → DPJP **tidak** berubah → jawaban dikembalikan ke DPJP asal → pasien lanjut pada **registrasi/encounter yang sama** (tidak dibuat registrasi baru). Konsul bersifat **terminal 1:1**.

### Skenario 2 — Order Rujukan Internal (di luar form ini)
Sistem menampilkan **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)** karena DPJP berpindah. Penyimpanan asesmen/registrasi menutup order dengan **outcome rujuk** → memicu **registrasi baru**. Rujuk dapat **berantai** (mis. Jantung → Saraf → Penyakit Dalam → …); tiap hop = order rujuk terpisah dengan tautan ke rujuk induk (BR-08). Detail di PRD Asesmen Rawat Jalan / Registrasi / Discharge.

### Skenario 3 — Edit pasca-simpan (jalur Konsul)
Setelah status *Selesai Dijawab*, jawaban dapat diedit oleh **dokter + casemix** (casemix untuk klaim); perawat tetap read-only. Setiap edit tercatat di audit trail (BR-05).

### Skenario 4 — Cetak & Kembali (jalur Konsul)
Print Hasil Konsulan aktif setelah jawaban tersimpan. Kembali membatalkan tanpa menyimpan (dengan konfirmasi bila ada perubahan belum tersimpan).

### Skenario 5 — `[v1.7]` Konsul yang disarankan menjadi Rujuk Internal (dokumentasi → tindak lanjut sisi pengirim)
Pasien awalnya hanya **dikonsulkan** (order Konsul Internal → Form Jawaban Konsul). Saat menjawab, dokter penerima menilai pasien **perlu kontrol 1× lagi** dan mengisi **Rekomendasi Tindak Lanjut Konsul = "Disarankan Rujuk Internal"** (dokumentasi, non-mengikat — FR-11, BR-09).
1. Dokter menyimpan jawaban → episode **Konsul selesai 1×** (status *Selesai Dijawab*, terminal). **DPJP tetap** perujuk; **tidak** ada perpindahan DPJP dan **tidak** ada registrasi baru dari form ini.
2. Rekomendasi tampil pada jawaban yang dibaca **DPJP pengirim** (dan pada cetak "Hasil Konsulan").
3. **DPJP pengirim** menindaklanjuti: membuat **order Rujuk Internal** ke poli konsulan terakhir (mekanisme di **PRD Order Konsul** — sisi pengirim).
4. Order rujuk baru tersebut menjalankan routing normal (BR-03): **DPJP berpindah** ke poli penerima, tampil **Form Asesmen sesuai poli**, memicu **registrasi baru** — sehingga **wewenang DPJP berpindah** sebagaimana mestinya.

## 9. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-01** | **Aktivasi Simpan.** Tombol *Simpan Perubahan* aktif hanya jika: Jawaban Konsulan terisi **DAN** ≥1 Diagnosa Konsulan **DAN** ≥1 Tindakan yang Diberikan, serta ada perubahan dari state tersimpan. **`[v1.6]`** Syarat "Update Status DPJP terpilih" **dihapus** (field tidak ada lagi). | FR-04; FR-05; FR-06; FR-10 |
| **BR-02** | **Repeater minimal.** Diagnosa Konsulan & Tindakan yang Diberikan wajib memiliki minimal satu baris valid; baris kosong diabaikan/diblok saat simpan. Keduanya **teks bebas** (belum berkode ICD) pada scope saat ini. | FR-05; FR-06 |
| **BR-03** | **`[v1.6]` Routing & dampak berdasarkan tipe order.** Status DPJP **tidak dipilih manual**; ditentukan oleh **tipe order** poli asal (read-only). *Order Konsul Internal* → DPJP **tetap** (perujuk); sistem menampilkan **Form Jawaban Konsul** (modul ini); pasien melanjutkan pada **registrasi/encounter yang sama** (tidak dibuat registrasi baru). *Order Rujukan Internal* → **DPJP berpindah** ke poli penerima; sistem menampilkan **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)**, **bukan** Form Jawaban Konsul; dimodelkan sebagai **"discharge rujuk"** yang **memicu registrasi baru** (modul Registrasi). PRD ini **tidak** menampilkan/menangani jawaban rujuk. Detail status pulang / discharge & guard anti-loop → **PRD Discharge** (OQ-03 resolved; supersede OQ-02). | FR-03; OQ-02; OQ-03 |
| **BR-04** | **Kepemilikan jawaban.** Yang **mengisi & finalisasi (Simpan) awal** hanya **dokter** poli penerima. Perawat tidak mengisi. | OQ-12 |
| **BR-05** | **Status & edit pasca-simpan.** Menyimpan jawaban mengubah status konsul → *Selesai Dijawab*. Setelah tersimpan, jawaban **dapat diedit oleh dokter dan casemix** — casemix diberi akses mengedit asesmen/jawaban untuk **kebutuhan klaim** (mengikuti konvensi PRD Asesmen, OQ-07). Perawat tetap read-only. Setiap edit tercatat di audit trail. | OQ-07 |
| **BR-06** | **Konteks kanan.** Panel kanan menampilkan **seluruh kunjungan pasien** dengan default riwayat poli pengirim; filter unit/tanggal untuk penelusuran, sesuai hak akses. Konten copyable ke field penunjang (§ Data Requirements). | FR-07; FR-09 |
| **BR-07** | **Diagnosa vs Tindakan/BHP terhadap klaim & billing** (OQ-08 resolved). *Diagnosa Konsulan* → masuk **e-klaim** pada **preview dokumen asesmen**; **tidak diklaim/dibilling terpisah** — karena bukan item billing, format teks bebas dapat diterima. *Tindakan & BHP* → **masuk billing**; entri/kode billable dilakukan melalui mekanisme **Input Tindakan & BHP**; field teks-bebas "Tindakan yang Diberikan" pada form ini bersifat naratif/disposisi, bukan sumber item billing. | OQ-08 |
| **BR-08** | **Konsul terminal vs Rujuk berantai** (OQ-11 refined). Setiap **order** (konsul/rujuk) memiliki tepat **satu** jawaban/penanganan (satu record — bukan thread balasan berulang). *Konsul Internal* bersifat **terminal**: 1 konsul → 1 jawaban (Form Jawaban Konsul) → kembali ke DPJP asal; bila butuh opini spesialisasi lain, dokter membuat **order konsul baru** (1:1 baru). *Rujukan Internal* dapat **berantai** (mis. Jantung → Saraf → Penyakit Dalam → …); tiap hop = **order rujuk terpisah** yang **routing ke Form Asesmen sesuai poli**, memindahkan DPJP & memicu registrasi baru (BR-03), serta **menaut ke rujuk induk (parent)**. **Visibilitas rantai** → **PRD Riwayat**; **kebijakan guard anti-loop** → **PRD Discharge** (OQ-14 resolved). | OQ-11; OQ-14 |
| **BR-09** | **`[v1.7]` Rekomendasi Tindak Lanjut Konsul bersifat dokumentasi non-mengikat.** Field "Rekomendasi Tindak Lanjut Konsul" pada Jawaban Konsul (nilai: *Cukup Konsul Internal* / *Disarankan Rujuk Internal*) adalah **catatan dokumentasi klinis** — **tidak** mengubah DPJP, **tidak** memicu routing/registrasi/discharge, dan **tidak** memengaruhi aktivasi Simpan (BR-01). Nilainya **tidak wajib**; default *Cukup Konsul Internal*. Fungsinya menampilkan kesimpulan penerima kepada **DPJP pengirim** untuk menentukan *next action*. Bila nilainya *Disarankan Rujuk Internal*: episode **Konsul tetap terminal (selesai 1×)** (BR-08); perpindahan wewenang DPJP terjadi **hanya** bila DPJP pengirim membuat **order Rujuk Internal** baru ke poli konsulan terakhir (sisi pengirim — PRD Order Konsul), yang lalu menjalankan routing rujuk (BR-03). | FR-11; BR-01; BR-03; BR-08 |

## 10. State Machine — Status Konsul (Sisi Penerima, jalur Konsul Internal)

Mengikuti konvensi checkpoint tri-state modul asesmen. **`[v1.6]`** State machine ini berlaku untuk **order Konsul Internal** (Form Jawaban Konsul). Untuk **order Rujukan Internal**, alur ditangani **Form Asesmen sesuai poli + modul Registrasi** (outcome discharge rujuk berada di luar form ini — lihat BR-03).

### 10.1 Status
| Status | Makna | Trigger |
|--------|-------|---------|
| **Tidak Diisi / Menunggu Jawaban** | Konsul masuk, belum dibuka/diisi. | Order Konsul Internal diterima. |
| **Sedang Diproses** | Form dibuka & sebagian terisi, belum disimpan final. | Dokter mulai mengisi. |
| **Selesai (Selesai Dijawab)** | Jawaban tersimpan lengkap. | Simpan Perubahan sukses (BR-01). |

### 10.2 Transisi
```
Menunggu Jawaban --> Sedang Diproses --> Selesai Dijawab
                                              ^___________|  (edit oleh DOKTER + CASEMIX — OQ-07)

[Order Rujukan Internal] --> DILUAR FORM INI: Form Asesmen sesuai poli --> Discharge Rujuk --> Registrasi baru
                            (ditangani PRD Asesmen Rawat Jalan + modul Registrasi + PRD Discharge)
```

### 10.3 Konsul terminal vs Rujuk berantai (OQ-11 — refined)
Setiap order = **1 jawaban/penanganan** (record tunggal). **Konsul internal** = terminal (opini lain → order konsul baru), ditangani Form Jawaban Konsul. **Rujukan internal** = **rantai** (Jantung → Saraf → Dalam → …); tiap hop = order rujuk terpisah yang routing ke **Form Asesmen sesuai poli** + tautan parent + registrasi baru + perpindahan DPJP. Visibilitas rantai → **PRD Riwayat**; guard anti-loop → **PRD Discharge**. Lihat **BR-08**.

## 11. Routing Berdasarkan Tipe Order (menggantikan Disposisi Update Status DPJP)

> **`[v1.6]`** Tidak ada field/pemilihan manual. Sistem menentukan form dan dampak DPJP **otomatis dari tipe order** poli asal (read-only). Menggantikan section "Disposisi Update Status DPJP" v1.5 dan supersede OQ-02.

| Tipe Order (read-only) | Form yang Ditampilkan | DPJP | Registrasi | Rule |
|------------------------|-----------------------|------|------------|------|
| **Konsul Internal** | **Form Jawaban Konsul** (modul ini) | **Tetap** (perujuk) | Encounter/registrasi **sama** (tanpa registrasi baru) | BR-03; BR-08 |
| **Rujukan Internal** | **Form Asesmen sesuai poli** (PRD Asesmen Rawat Jalan — *bukan* form ini) | **Berpindah** ke poli penerima | **Registrasi baru** (discharge rujuk, modul Registrasi) | BR-03; BR-08 |

**Kontrol:** penentuan bersifat **sistemik & tidak dapat diubah** oleh penerima. Konsekuensi UI: form ini **hanya** muncul untuk order Konsul Internal; tidak ada radio button status pada layar.

> **`[v1.7]` Bedakan dari Rekomendasi Tindak Lanjut Konsul.** Routing di atas bersifat **mengikat** (sistem, dari tipe order). Sementara **Rekomendasi Tindak Lanjut Konsul** (FR-11, BR-09) yang ada di Jawaban Konsul bersifat **dokumentasi non-mengikat** — tidak mengubah routing/DPJP; hanya membantu DPJP pengirim menentukan apakah perlu membuat order rujuk baru.

## 12. Functional Requirements

> Diturunkan dari §8 Kebutuhan Fungsional sumber. **`[v1.6]`** FR-03 diubah dari "Update Status DPJP (field)" menjadi "Routing otomatis berdasarkan tipe order". Nomor FR lain dipertahankan agar referensi silang stabil.

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-01** | **Header Pasien (Global)** — menampilkan identitas pasien read-only: No RM, Nama (jenis kelamin), Tanggal Lahir + usia terhitung otomatis (Tahun/Bulan/Hari). Sumber: Master Pasien / registrasi kunjungan. | Master Pasien |
| **FR-02** | **Riwayat Konsulan Poli Asal (read-only)** — menampilkan ringkasan permintaan konsul poli asal: Badge tipe ("Konsultasi"/"Rujukan"), Asal Poli, Diagnosa (dilampirkan poli asal), Alasan Rujukan. Bersumber dari order konsul/rujukan sisi pengirim; read-only bagi penerima. | US-01; PRD Order Konsul |
| **FR-03** | **`[v1.6]` Routing otomatis berdasarkan tipe order** — saat poli penerima membuka item antrean, sistem membaca **tipe order** (read-only): bila **Konsul Internal** → tampilkan **Form Jawaban Konsul** (modul ini, DPJP tetap perujuk); bila **Rujukan Internal** → tampilkan **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)** karena DPJP berpindah. **Tidak ada pilihan/field status manual.** | US-04; BR-03 |
| **FR-04** | **Jawaban Konsulan (wajib)** — textarea teks bebas multiline untuk narasi jawaban dokter penerima (contoh: "Pro Ekstraksi Katarak OS"). | US-03; BR-01 |
| **FR-05** | **Diagnosa Konsulan (wajib, repeatable)** — input **teks bebas** (belum terpaut kode ICD-10 pada scope saat ini). Tombol **+** menambah baris, ikon **hapus** menghapus baris; minimal 1 baris terisi. Roadmap `[**]`: pemetaan ke ICD-10 (picker master) di iterasi berikutnya bila dibutuhkan untuk casemix/klaim. | US-03; BR-02; BR-07 |
| **FR-06** | **Tindakan yang Diberikan (wajib, repeatable)** — input **teks bebas** (belum terpaut kode ICD-9-CM pada scope saat ini). Tombol **+**/ikon **hapus**; minimal 1 baris terisi. Tindakan **billable** & **BHP** dientri/dikode melalui mekanisme **Input Tindakan & BHP**; field di sini bersifat naratif/disposisi. | US-03; BR-02; BR-07 |
| **FR-07** | **Hasil Pemeriksaan Penunjang (opsional)** — empat textarea teks bebas independen: Laboratorium, Radiologi, Elektro Medis, Patologi Anatomi. Bersifat manual, namun dokter **dapat menyalin (copy-paste)** dari riwayat layanan di panel kanan (tab Lab PK / Radiologi / Patologi Anatomi / Penunjang Lainnya). Belum ada auto-link/auto-populate dari order penunjang. | US-02; BR-06 |
| **FR-08** | **Aksi Footer Kiri** — **Kembali** (kembali ke daftar/antrean tanpa menyimpan; konfirmasi bila ada perubahan belum tersimpan) dan **I-CARE BPJS** (menampilkan preview I-CARE BPJS; syarat kode dokter/kode DPJP BPJS terisi; **akses hanya untuk dokter**). | US-02; Integrasi I-CARE |
| **FR-09** | **Panel Kanan — Riwayat Kunjungan Pengirim (Referensi, read-only)** — konteks klinis read-only: tab riwayat & penunjang (Riwayat rujukan, Riwayat kunjungan, Lab PK, Patologi Anatomi, Radiologi, Penunjang Lainnya), filter tanggal & unit, kartu kunjungan (SOAP) collapsible. Default memunculkan riwayat poli **pengirim**; seluruh kunjungan dapat ditelusuri via filter. Konten **copyable**. **Detail spesifikasi mengikuti PRD Riwayat terpisah** — PRD ini mereferensikan high-level. | US-02; BR-06; PRD Riwayat |
| **FR-10** | **Aksi Global (Footer Kanan)** — **Print Hasil Konsulan** (cetak dokumen jawaban terstruktur: identitas, riwayat poli asal, jawaban, diagnosa, tindakan, penunjang; aktif setelah tersimpan) dan **Simpan Perubahan** (menyimpan seluruh isian global; disabled sampai seluruh field wajib valid & ada perubahan). Kedua aksi bersifat **global** terhadap seluruh dokumen Jawaban Konsulan. | US-06; BR-01 |
| **FR-11** | **`[v1.7]` Rekomendasi Tindak Lanjut Konsul (dokumentasi, non-mengikat)** — pada bagian Jawaban Konsul (posisi bekas field "Update Status DPJP"), sediakan **template/pilihan** bagi dokter penerima untuk mencatat kesimpulan hasil konsul: **"Cukup Konsul Internal"** atau **"Disarankan Rujuk Internal (perlu kontrol 1× lagi / alih DPJP)"**, opsional disertai **catatan bebas** singkat. Field **tidak wajib** (default *Cukup Konsul Internal*), **tidak** mengubah DPJP/status, **tidak** memicu routing/registrasi, dan **tidak** memengaruhi aktivasi Simpan (BR-01, BR-09). Nilai & catatan **ikut tampil** pada jawaban yang dibaca DPJP pengirim dan pada cetak "Hasil Konsulan" (FR-10) untuk membantu penentuan tindak lanjut. | US-07; BR-09 |

## 13. User Stories

> Format "Sebagai … ingin … agar …". Acceptance Criteria terkait dipreservasi di § Kriteria Penerimaan.

| ID | User Story | Trace |
|----|------------|-------|
| **US-01** | Sebagai **dokter poli penerima**, saya ingin melihat diagnosa & alasan rujukan dari poli asal, agar memahami konteks permintaan konsul. | FR-02; AC-01 |
| **US-02** | Sebagai **dokter poli penerima**, saya ingin menelusuri riwayat kunjungan, lab, radiologi, dan penunjang lain milik pasien, agar asesmen saya berbasis data lengkap. | FR-07; FR-09; AC-09; AC-10 |
| **US-03** | Sebagai **dokter poli penerima**, saya ingin menuliskan jawaban konsul beserta diagnosa & tindakan, agar terekam terstruktur dan dapat dipakai untuk dokumentasi/e-klaim. | FR-04; FR-05; FR-06; AC-03; AC-06 |
| **US-04** | **`[v1.6]`** Sebagai **dokter poli penerima**, saya ingin sistem **otomatis menampilkan form yang sesuai dengan tipe order** (Konsul → Form Jawaban Konsul; Rujukan Internal → Form Asesmen sesuai poli), sehingga tanggung jawab DPJP jelas tanpa perlu memilih status secara manual. | FR-03; BR-03; AC-04; AC-05 |
| **US-05** | Sebagai **dokter poli pengirim**, saya ingin melihat jawaban konsul, agar dapat melanjutkan penanganan pasien. | RBAC (read-only pengirim); AC-05 |
| **US-06** | Sebagai **dokter**, saya ingin mencetak hasil konsul, untuk arsip fisik / dokumentasi pasien. | FR-10; AC-07 |
| **US-07** | **`[v1.7]`** Sebagai **dokter poli penerima**, saya ingin mendokumentasikan **kesimpulan/rekomendasi tindak lanjut** konsul (cukup konsul internal / disarankan rujuk internal), sehingga **DPJP pengirim** memiliki dasar untuk menentukan tindak lanjut — tanpa rekomendasi ini mengubah DPJP/status secara langsung. | FR-11; BR-09; AC-13 |

## 14. Data Requirements (Spesifikasi Field)

> Field demografi (Header Pasien) **reuse definisi kanonik dari Master Pasien / registrasi kunjungan** — nama, tipe, format, validasi **harus sama**. **`[v1.6]` Field `update_status_dpjp` DIHAPUS** (status mengikuti tipe order, bukan input).

### A. Header Pasien (Global) — FR-01
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| no_rm | No RM | Label | Tidak | Read-only | Master Pasien / registrasi | Kanonik dari registrasi kunjungan. |
| nama | Nama (jenis kelamin) | Label | Tidak | Read-only | Master Pasien / registrasi | Menampilkan jenis kelamin. |
| tgl_lahir_usia | Tanggal Lahir + Usia | Label | Tidak | Usia terhitung otomatis (Tahun/Bulan/Hari) | Master Pasien / registrasi | Usia dibuat otomatis oleh sistem. |

### B. Layar INPUT — Form Jawaban Konsul (Panel Kiri) — FR-02 s/d FR-07
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| badge_tipe_konsul | Badge Tipe Konsul | Label | Tidak | Read-only | Order konsul (pengirim) | "Konsultasi"/"Rujukan". **v1.6:** form ini dijangkau hanya untuk order Konsul Internal (routing FR-03). |
| asal_poli | Asal Poli | Label | Tidak | Read-only | Order konsul (pengirim) | Contoh: Klinik Jantung. |
| diagnosa_poli_asal | Diagnosa (poli asal) | List label | Tidak | Read-only | Order konsul (pengirim) | Contoh: IHD, cjhf, dm II. |
| alasan_rujukan | Alasan Rujukan | Label | Tidak | Read-only | Order konsul (pengirim) | Contoh: KONSUL. |
| jawaban_konsulan | Jawaban Konsulan | Textarea | Ya | Teks bebas, multiline | Manual | Contoh: "Pro Ekstraksi Katarak OS". |
| rekomendasi_tindak_lanjut | Rekomendasi Tindak Lanjut Konsul `[v1.7]` | Radio/pilihan + catatan | Tidak | Pilihan: "Cukup Konsul Internal" / "Disarankan Rujuk Internal"; catatan bebas opsional | Manual (default: Cukup Konsul Internal) | **Dokumentasi non-mengikat** — tidak mengubah DPJP/status, tidak memicu routing/registrasi, tidak memblokir Simpan. Tampil bagi DPJP pengirim & pada cetak Hasil Konsulan (BR-09, FR-11). |
| diagnosa_konsulan | Diagnosa Konsulan | Repeater teks | Ya | Min. 1 baris; +/hapus; **teks bebas** (belum berkode) | Manual | Roadmap `[**]`: picker ICD-10 (BR-02, BR-07). |
| tindakan_diberikan | Tindakan yang Diberikan | Repeater teks | Ya | Min. 1 baris; +/hapus; **teks bebas** (belum berkode) | Manual | Billable via Input Tindakan & BHP (BR-07). |
| lab | Laboratorium | Textarea | Tidak | Teks bebas | Manual / copy panel kanan | Opsional. |
| radiologi | Radiologi | Textarea | Tidak | Teks bebas | Manual / copy panel kanan | Opsional. |
| elektro_medis | Elektro Medis | Textarea | Tidak | Teks bebas | Manual / copy panel kanan | Opsional. |
| patologi_anatomi | Patologi Anatomi | Textarea | Tidak | Teks bebas | Manual / copy panel kanan | Opsional. |

> ~~update_status_dpjp | Update Status DPJP | Radio | Ya | …~~ **DIHAPUS pada v1.6** — status mengikuti tipe order (lihat FR-03, BR-03, §11).

### C. Riwayat Kunjungan Pengirim (Panel Kanan) — FR-09
Spesifikasi field detail panel Riwayat Kunjungan Pengirim (elemen, tipe, sumber, item data per tab & struktur SOAP/penunjang) **mengikuti PRD Riwayat terpisah**. Pada PRD ini panel bersifat **referensi read-only**; kebutuhan spesifik konteks Jawaban Konsulan: default riwayat poli pengirim, konten **copyable**, read-only (lihat FR-09, BR-06).

## 15. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-01** | Performa | Panel kanan (riwayat + penunjang) dimuat **< 2 detik** untuk pasien dengan ≤ 50 kunjungan; gunakan lazy-load/pagination bila lebih. | §13 sumber |
| **NFR-02** | Usability (Autosave/Draft) | Pertimbangkan draft otomatis agar isian tidak hilang bila sesi terputus (selaras status "Sedang Diproses"). | §13 sumber; State Machine |
| **NFR-03** | Auditabilitas | Catat siapa & kapan menjawab/mengedit konsul (untuk BR-04/BR-05). | BR-04; BR-05 |
| **NFR-04** | Konsistensi UI | Mengikuti design system Neurovi (dua panel, tab, collapsible card). | §13 sumber |
| **NFR-05** | Keandalan (Resiliensi) | Kegagalan I-CARE/BPJS tidak boleh memblokir pengisian jawaban konsul (degradasi anggun). | §13 sumber; Integrasi |

## 16. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **I-CARE BPJS** | Menampilkan **preview I-CARE** riwayat pelayanan peserta JKN. Syarat kode dokter terisi; **akses dokter-only** (OQ-09). Kegagalan layanan tidak memblokir form (NFR-05). | Live/Integrasi | FR-08; NFR-05 |
| **`[v1.6]` PRD Asesmen Rawat Jalan** | Target routing untuk **order Rujukan Internal** — Form Asesmen sesuai poli ditampilkan alih-alih Form Jawaban Konsul (BR-03, FR-03). | Internal (hard dependency) | FR-03; BR-03 |
| **Master Diagnosa (ICD-10) / Tindakan (ICD-9-CM)** | **Tidak** dipakai pada input Diagnosa/Tindakan di form ini (teks bebas). Penggunaan untuk tampilan panel kanan mengikuti **PRD Riwayat**. | Konsumen (tak dipakai di form) | BR-02; OQ-04; OQ-13 |
| **Modul E-Klaim** | Diagnosa masuk e-klaim via **preview dokumen asesmen** (tidak diklaim terpisah). | Internal | BR-07 |
| **Modul Billing / Input Tindakan & BHP** | Tindakan & BHP yang billable masuk billing melalui mekanisme Input Tindakan & BHP. | Internal | BR-07 |
| **Modul Registrasi** | **Order Rujukan Internal** memicu **registrasi baru** (discharge rujuk) via flow asesmen/registrasi. Rujuk dapat **berantai**; tiap hop = registrasi baru dengan tautan ke rujuk induk. | Internal | BR-03; BR-08 |
| **Satu Sehat (FHIR)** | **Belum dipetakan** pada scope saat ini (OQ-10). Kandidat future: Encounter/Condition/Procedure/ServiceRequest. `[**]` | Belum dipetakan | OQ-10 |
| **Print/Report Engine** | Template "Hasil Konsulan". | Internal | FR-10 |

### Dependency (tipe & dampak)
| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| **PRD Order Konsul (sisi pengirim)** | Hard | Tidak ada **tipe order** & sumber data Riwayat Konsulan Poli Asal — routing FR-03 & FR-02 tidak dapat berjalan. |
| **`[v1.6]` PRD Asesmen Rawat Jalan** | Hard | Order Rujukan Internal tidak punya form tujuan — routing rujuk (FR-03, BR-03) tidak tuntas. |
| **PRD Riwayat** | Hard | Panel kanan Riwayat Kunjungan Pengirim & visibilitas rantai rujuk tak terdefinisi lengkap — FR-09 hanya high-level. |
| **PRD Discharge** | Hard | Detail status pulang / discharge rujuk internal & guard anti-loop tak tersedia — outcome order rujuk (BR-03/BR-08) tak tuntas. |
| **Modul Registrasi** | Hard | Outcome discharge-rujuk tidak dapat memicu registrasi baru (BR-03). |

## 17. Keputusan Desain (Resolved)

> Seluruh Open Question (OQ-01 s/d OQ-14) telah terjawab. **`[v1.6]` OQ-02 di-supersede** oleh keputusan routing baru.

| ID | Topik | Keputusan Final |
|----|-------|-----------------|
| OQ-01 | Kode/nama dokumen | **"PRD Asesmen Jawaban Konsulan"** (ref internal PRD-P-JWK-RJ). |
| OQ-02 | Update Status DPJP: default & dapat diubah? | **`[v1.6 — SUPERSEDE]` Field "Update Status DPJP" dihapus.** Status **mengikuti tipe order** (tidak dapat diubah penerima). Order Konsul → Form Jawaban Konsul (DPJP tetap); Order Rujukan Internal → Form Asesmen sesuai poli (DPJP berpindah). *(Sebelumnya v1.x: default dari order, dapat diubah — tidak berlaku lagi.)* |
| OQ-03 | Rujukan Internal: registrasi baru / lanjut encounter? | **Rujuk = registrasi baru** (dimodelkan sebagai *discharge rujuk*, via Form Asesmen sesuai poli + modul Registrasi); **Konsul = registrasi/encounter sama**. |
| OQ-04 | Diagnosa Konsulan wajib ICD-10? | **Teks bebas** (belum berkode). |
| OQ-05 | Hasil Penunjang: teks bebas / auto-link? | **Teks bebas**, dapat **copy-paste dari panel kanan**. |
| OQ-06 | Cakupan panel kanan? | **Seluruh kunjungan pasien**, default munculkan riwayat pengirim. |
| OQ-07 | Edit/addendum setelah selesai? | **Boleh diedit oleh dokter + casemix** (casemix untuk kebutuhan klaim, sesuai PRD Asesmen). Perawat read-only. |
| OQ-08 | Diagnosa/tindakan → billing? | **Diagnosa → e-klaim** (preview dokumen asesmen, tidak diklaim terpisah). **Tindakan & BHP → billing** (via Input Tindakan & BHP). |
| OQ-09 | I-CARE BPJS: data & akses? | Preview I-CARE; **butuh kode dokter terisi**; **akses dokter-only**. |
| OQ-10 | Kirim ke Satu Sehat (FHIR)? | **Belum dipetakan** — di luar scope saat ini. `[**]` |
| OQ-11 | Thread jawaban / konsul berulang? | **1 order = 1 jawaban.** Konsul internal **terminal** (opini lain → order konsul baru); rujuk internal **berantai** (tiap hop order rujuk terpisah → Form Asesmen poli, tautan parent) — BR-08. |
| OQ-12 | Perawat vs dokter isi/final? | **Isi & final awal: hanya dokter.** (Edit pasca-simpan: dokter + casemix — lihat OQ-07.) |
| OQ-13 | Tindakan yang Diberikan teks bebas? | **Ya, teks bebas** (saat ini). |
| OQ-14 | Guard anti-loop rantai rujuk & visibilitas rantai? | **Visibilitas rantai → PRD Riwayat** (tab Riwayat rujukan). **Kebijakan guard anti-loop → PRD Discharge** (saat detailing status pulang rujuk internal). |

## 18. Kriteria Penerimaan (Acceptance Criteria)

> Preservasi §16 sumber (pola Given-When-Then). **`[v1.6]`** AC-02/03/04/05/12 disesuaikan dengan penghapusan field status & routing by tipe order.

- **AC-01** — *Given* dokter penerima membuka konsul masuk (order Konsul Internal), *when* halaman dimuat, *then* Riwayat Konsulan Poli Asal (asal poli, diagnosa, alasan) tampil read-only di kiri dan kartu kunjungan pengirim tampil di kanan.
- **AC-02** — **`[v1.6]`** *Given* Form Jawaban Konsul terbuka, *when* field wajib (Jawaban Konsulan, ≥1 Diagnosa Konsulan, ≥1 Tindakan) belum lengkap, *then* tombol Simpan Perubahan disabled. *(Tidak ada lagi syarat pemilihan status DPJP.)*
- **AC-03** — **`[v1.6]`** *Given* Jawaban Konsulan, ≥1 Diagnosa Konsulan, dan ≥1 Tindakan terisi, *when* menekan Simpan, *then* jawaban tersimpan dan status konsul → Selesai Dijawab.
- **AC-04** — **`[v1.6]`** *Given* order bertipe **Rujukan Internal**, *when* poli penerima membuka item antrean, *then* sistem menampilkan **Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)** — **bukan** Form Jawaban Konsul, DPJP berpindah ke poli penerima, dan alur **discharge rujuk + registrasi baru** ditangani via flow asesmen/registrasi (BR-03). *(Form Jawaban Konsul tidak ditampilkan untuk order rujuk.)*
- **AC-05** — **`[v1.6]`** *Given* order bertipe **Konsul Internal**, *when* poli penerima membuka item antrean, *then* sistem menampilkan **Form Jawaban Konsul**, DPJP tetap dokter poli asal, **tidak ada registrasi baru**, dan setelah tersimpan jawaban tampil bagi pengirim.
- **AC-06** — *Given* menambah baris Diagnosa/Tindakan via "+", *when* mengetik teks bebas, *then* baris tersimpan; via ikon hapus baris terhapus. Minimal 1 baris terisi agar Simpan aktif.
- **AC-07** — *Given* jawaban tersimpan, *when* menekan Print Hasil Konsulan, *then* dokumen cetak terstruktur dihasilkan.
- **AC-08** — *Given* pengguna adalah dokter dengan kode dokter terisi, *when* menekan I-CARE BPJS, *then* preview I-CARE tampil; *given* pengguna non-dokter / kode dokter kosong, *then* akses ditolak; *when* layanan gagal, *then* muncul pesan error tanpa memblokir form.
- **AC-09** — *Given* panel kanan dimuat, *then* default menampilkan riwayat poli **pengirim**; *when* dokter memfilter unit/tanggal, *then* seluruh kunjungan pasien dapat ditelusuri. *(Detail perilaku panel — tab, collapse, item data — mengikuti PRD Riwayat.)*
- **AC-10** — *Given* dokter menyorot teks di panel kanan (Lab/Radiologi/PA/Penunjang), *when* menyalin & menempel ke field Hasil Pemeriksaan Penunjang, *then* teks tersalin utuh.
- **AC-11** — *Given* jawaban berstatus Selesai Dijawab, *when* **dokter atau casemix** mengedit & menyimpan ulang, *then* perubahan tersimpan & tercatat di audit trail; *given* pengguna perawat, *then* opsi edit tidak tersedia.
- **AC-12** — **`[v1.6]`** *Given* pasien telah dirujuk internal (mis. Jantung → Saraf), *when* dibuat **order rujuk internal lanjutan** (Saraf → Penyakit Dalam), *then* sistem menampilkan **Form Asesmen sesuai poli** pada poli tujuan berikutnya, terbentuk record rujuk baru yang menaut ke rujuk induk, DPJP berpindah, dan registrasi baru dipicu. *(Visibilitas rantai di PRD Riwayat; kebijakan guard anti-loop di PRD Discharge.)*
- **AC-13** — **`[v1.7]`** *Given* dokter penerima mengisi **Rekomendasi Tindak Lanjut Konsul = "Disarankan Rujuk Internal"** lalu menyimpan, *when* proses selesai, *then* episode **Konsul tetap Selesai Dijawab (terminal 1×)**, **DPJP tidak berpindah** dan **tidak ada registrasi baru** dari form ini, serta rekomendasi (beserta catatan) **tampil** pada jawaban yang dibaca DPJP pengirim dan pada cetak Hasil Konsulan. *(Perpindahan DPJP hanya terjadi bila DPJP pengirim membuat order Rujuk Internal baru — sisi pengirim, BR-03/BR-09.)* *Given* field dibiarkan kosong/di-default, *then* Simpan tetap dapat aktif (field tidak wajib, BR-01/BR-09).

## 19. Catatan UI/UX

> Preservasi §14 sumber, disesuaikan v1.6.

- Layout dua kolom: **kiri = form input**, **kanan = referensi read-only** (tab riwayat + penunjang), keduanya scroll independen.
- **`[v1.6]`** **Tidak ada radio button "Update Status DPJP"** pada layar. Form Jawaban Konsul hanya tampil untuk order Konsul Internal.
- **`[v1.7]`** Pada posisi bekas "Update Status DPJP" ditempatkan **Rekomendasi Tindak Lanjut Konsul** (template/pilihan + catatan opsional). Beri penanda visual bahwa field ini **bersifat rekomendasi/dokumentasi** (mis. label "Catatan tindak lanjut — tidak mengubah status DPJP"), agar tidak dikira mengubah alur. Tidak diberi tanda wajib (\*).
- Tanda bintang (\*) menandai field wajib: Jawaban Konsulan, Diagnosa Konsulan, Tindakan yang Diberikan.
- Repeater (Diagnosa/Tindakan) memakai pola ikon **hapus** + **+** sejajar input.
- Kartu SOAP dapat di-*collapse* per kartu maupun serentak ("Tutup Semua").
- *Simpan Perubahan* tampil disabled hingga valid (sesuai screenshot).

## 20. Roadmap

| Fase | Cakupan |
|------|---------|
| **Scope saat ini (v1.6)** | Form Jawaban Konsul untuk **order Konsul Internal**; Diagnosa & Tindakan **teks bebas**; panel kanan referensi high-level; **routing otomatis by tipe order** (rujuk → Form Asesmen poli); aksi global Simpan & Print; preview I-CARE BPJS (dokter-only). |
| **Roadmap** `[**]` | Pemetaan **Diagnosa → ICD-10** & **Tindakan → ICD-9-CM** (picker master) untuk kebutuhan casemix/klaim. |
| **Kandidat future** `[**]` | Pemetaan **Satu Sehat (FHIR)** — Encounter/Condition/Procedure/ServiceRequest (OQ-10, belum dipetakan). |

## 21. Asumsi

- `[ASUMSI]` **`[v1.6]`** **Form Asesmen sesuai poli** tersedia via **PRD Asesmen Rawat Jalan** untuk menangani order Rujukan Internal (target routing) — dasar: BR-03, FR-03.
- `[ASUMSI]` **Order konsul/rujukan sisi pengirim** menyediakan **tipe order** (Konsul/Rujukan Internal) beserta Badge Tipe, Asal Poli, Diagnosa poli asal, dan Alasan Rujukan sebagai read-only ke modul ini — dasar: FR-02, FR-03.
- `[ASUMSI]` Master **ICD-10 & ICD-9-CM** sudah tersedia dan dikonsumsi modul lain (tidak dibuat di modul ini) — dasar: §4 Out-of-Scope.
- `[ASUMSI]` Mekanisme **registrasi baru** tersedia di **modul Registrasi** untuk memproses outcome discharge-rujuk order rujuk — dasar: BR-03.
- `[ASUMSI]` Konvensi akses **edit casemix** untuk kebutuhan klaim mengikuti **PRD Asesmen** — dasar: BR-05 / OQ-07.

## 22. Pertanyaan Terbuka

- Seluruh keputusan desain telah diselesaikan (OQ-01 s/d OQ-14 — lihat §17); tidak ada pertanyaan terbuka substansi pada v1.6.
- `[PERLU KONFIRMASI]` **Metadata** yang belum tercantum di sumber: **Reviewer Teknis (tim)** dan **Target Release**.

## 23. Change Log

| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| **1.7** | 2 Juli 2026 | Tim Product | **Tambah field "Rekomendasi Tindak Lanjut Konsul"** di bagian Jawaban Konsul (posisi bekas "Update Status DPJP") — pilihan *Cukup Konsul Internal* / *Disarankan Rujuk Internal* + catatan opsional. Bersifat **dokumentasi klinis non-mengikat**: tidak mengubah DPJP, tidak memicu routing/registrasi, tidak memblokir Simpan. Membantu DPJP pengirim menentukan tindak lanjut; bila disarankan rujuk, episode konsul tetap selesai 1× (terminal) dan perpindahan DPJP hanya via order rujuk baru sisi pengirim. Tambah FR-11, BR-09, US-07, AC-13, field data `rekomendasi_tindak_lanjut`, Skenario 5; catatan pembeda di §11. |
| **1.6** | 2 Juli 2026 | Tim Product | **Field "Update Status DPJP" dihapus.** Status mengikuti **tipe order** (tidak dapat diubah penerima). **Order Konsul Internal → Form Jawaban Konsul** (DPJP tetap perujuk, encounter sama). **Order Rujukan Internal → Form Asesmen sesuai poli (PRD Asesmen Rawat Jalan)**, bukan form ini (DPJP berpindah, discharge rujuk + registrasi baru). Cakupan form ini menjadi **hanya order Konsul Internal**. FR-03 diubah menjadi "Routing otomatis berdasarkan tipe order". State Machine: state "Discharge Rujuk" dipindah ke luar form (jalur asesmen/registrasi). Supersede OQ-02. Penyesuaian BR-01/03/08, US-04, Data Requirements, AC-02/03/04/05/12; tambah dependency PRD Asesmen Rawat Jalan. |
| **1.5** | 1 Juli 2026 | Tim Product | OQ-14 resolved: **visibilitas rantai rujuk → PRD Riwayat** (tab Riwayat rujukan); **kebijakan guard anti-loop → PRD Discharge** (saat detailing status pulang rujuk internal). |
| **1.4** | — | Tim Product | Print & Simpan = aksi **global**. Edit pasca-simpan: **dokter + casemix** (klaim). Konsul internal = terminal 1:1; **rujuk internal = rantai** (tautan parent, registrasi baru per hop) — BR-08. |
| **1.3** | — | Tim Product | Panel kanan **Riwayat Kunjungan Pengirim** dinyatakan high-level (referensi). Detail item data/tab/SOAP/penunjang dipindah ke **PRD Riwayat terpisah**. |
| **1.2** | — | Tim Product | Resolve OQ-01, 03, 07, 08, 09, 11, 12, 13. Rujuk = registrasi baru (discharge rujuk); Konsul = encounter sama. Diagnosa → e-klaim (bukan billing terpisah); Tindakan & BHP → billing. I-CARE butuh kode dokter, akses dokter-only. Edit pasca-simpan: dokter saja. |

---

> *Draft v1.7 — Menambah field Rekomendasi Tindak Lanjut Konsul (dokumentasi klinis non-mengikat) pada Jawaban Konsul: mencatat kesimpulan "cukup Konsul Internal" atau "disarankan Rujuk Internal" untuk membantu DPJP pengirim menentukan tindak lanjut; tidak mengubah DPJP/routing/registrasi. Melanjutkan model v1.6: field Update Status DPJP dihapus; routing form mengikuti tipe order (Konsul Internal → Form Jawaban Konsul; Rujukan Internal → Form Asesmen sesuai poli / PRD Asesmen Rawat Jalan). Perpindahan wewenang DPJP hanya via order rujuk. Cakupan modul ini tetap hanya order Konsul Internal. Ketergantungan PRD terpisah: PRD Order Konsul (sisi pengirim + tipe order + tindak lanjut rujuk), PRD Asesmen Rawat Jalan (target routing rujuk), PRD Riwayat (panel kanan + rantai rujuk), PRD Discharge (status pulang rujuk + guard loop), modul Registrasi. Pengkodean ICD Diagnosa/Tindakan = roadmap.*
