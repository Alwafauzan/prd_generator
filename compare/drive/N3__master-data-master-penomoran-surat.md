# PRD — Master Data Master Penomoran Surat

**Related Document:** N/A
**Versi:** 1.0 - Draft awal
**Tanggal:** 2026-07-16

## 1. Metadata Dokumen

| Item | Keterangan |
|------|------------|
| **Nama Modul** | Master Data — Master Penomoran Surat |
| **Kode Fitur** | N3 |
| **Cluster** | Control Panel |
| **Target Pengguna** | Administrator SIMRS / IT RS, Rekam Medis, Manajemen |
| **Tipe RS** | Tipe C & D |
| **Approval** | [Nama Stakeholder, Jabatan, Tanggal] |
| **Related Documents** | N/A |
| **Document Version** | 2026-07-16, v1.0, Draft awal |

**Ringkasan Perubahan (Change Log)**

| Tanggal | Versi | Deskripsi Perubahan | Penulis |
|---------|-------|---------------------|---------|
| 2026-07-16 | 1.0 | Draft awal PRD Master Penomoran Surat | System Analyst |

## 2. Overview & Background

**Overview / Brief Summary**

Master Penomoran Surat adalah modul konfigurasi terpusat yang memungkinkan administrator rumah sakit mengelola **format dan aturan penomoran** untuk setiap jenis surat internal yang diterbitkan oleh SIMRS, secara **mandiri** tanpa perlu mengubah source code atau melakukan deployment.

Setiap jenis surat (mis. Surat Kontrol Rawat Jalan, Surat Perintah Rawat Inap, Rujukan ke RS Lain, Rujuk Balik FKTP PRB/Non-PRB, Keterangan Dokter, Keterangan Kematian) dapat memiliki: format nomor berbasis **placeholder** (Running Number, Bulan, Tahun, Unit, Prefix), **prefix/suffix**, **padding digit** running number, **metode reset** (Tidak Reset / Bulanan / Tahunan), serta status **aktif/nonaktif**. Sistem menghasilkan nomor otomatis dari konfigurasi aktif dan menjamin **keunikan nomor (anti-duplikat)** walau surat diterbitkan secara bersamaan (concurrent).

**Batas tegas (penting):** Modul ini **hanya** mengatur penomoran **surat internal SIMRS**. Dokumen yang nomor referensinya berasal dari **sistem eksternal** — Bridging BPJS/VClaim (SEP, Surat Kontrol BPJS, SPRI BPJS, Rujukan BPJS) — **TIDAK** menggunakan konfigurasi ini; sistem tetap memakai nomor yang dikembalikan (response) oleh layanan eksternal dan tidak boleh menimpanya.

**Business Process (As-Is vs To-Be)**

* **As-Is (kondisi V1 saat ini):**
    * Penomoran seluruh surat **di-hardcode di backend**. Format, prefix, dan aturan reset tertanam di source code.
    * Setiap perubahan format nomor surat memerlukan **perubahan source code + deployment** aplikasi, sehingga lambat dan bergantung pada tim developer.
    * Rumah sakit **tidak punya fleksibilitas** menyesuaikan format nomor sesuai kebijakan internal atau regulasi.
    * Risiko inkonsistensi dan potensi duplikasi nomor karena logika tersebar.

* **To-Be (solusi yang diusulkan):**
    * Master mandiri: administrator mengonfigurasi penomoran per jenis surat lewat satu halaman terpusat, **tanpa deployment / downtime**.
    * Sistem generate nomor otomatis dari **konfigurasi aktif**, dengan running number auto-increment saat surat berhasil diterbitkan.
    * Reset running number otomatis sesuai metode (Bulanan/Tahunan/Tidak Reset).
    * **Preview** format nomor sebelum disimpan.
    * Penjaminan **keunikan nomor** melalui mekanisme sequence atomik (anti-duplikat concurrent).
    * Pemisahan tegas: sebelum generate, sistem **mengecek sumber penomoran** — internal (pakai master ini) vs eksternal (pakai response layanan eksternal, tidak di-generate).

## 3. Goals & Metrics

| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1 | Kemandirian konfigurasi | 100% perubahan format nomor surat internal dapat dilakukan admin tanpa deployment / perubahan source code. |
| 2 | Keunikan nomor (anti-duplikat) | 0 nomor duplikat pada seluruh surat internal, termasuk saat penerbitan concurrent (uji beban ≥ 50 request bersamaan per jenis surat). |
| 3 | Akurasi reset sequence | 100% running number ter-reset benar sesuai metode: Bulanan (awal bulan) & Tahunan (awal tahun); Tidak Reset tidak pernah reset. |
| 4 | Konsistensi konfigurasi | Tepat **1** konfigurasi aktif per jenis surat setiap saat (tidak boleh 0 saat menerbitkan, tidak boleh > 1 aktif). |
| 5 | Akurasi preview | Preview nomor 100% identik dengan format nomor pertama yang akan digenerate untuk periode berjalan. |
| 6 | Pemisahan sumber eksternal | 0 kasus nomor BPJS/eksternal (SEP, Surat Kontrol BPJS, SPRI, Rujukan BPJS) yang di-generate/ditimpa oleh master ini. |
| 7 | Efisiensi operasional | Waktu konfigurasi jenis surat baru ≤ 5 menit oleh admin tanpa bantuan developer. |
| 8 | Performa generate | Waktu generate 1 nomor surat ≤ 300 ms (p95) pada kondisi normal. [ASUMSI] |

## 4. Scope Definition & Phasing

| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| Konfigurasi Penomoran (CRUD) | Create, Read/List, Update, hapus/nonaktif konfigurasi per jenis surat | Perubahan konfigurasi melewati **approval berjenjang** sebelum berlaku |
| Format Nomor (Placeholder) | Susun format via placeholder Running Number / Bulan / Tahun / Unit / Prefix + prefix/suffix + padding digit | — |
| Running Number | Auto-increment saat surat terbit; padding sesuai konfigurasi | — |
| Metode Reset | Tidak Reset / Bulanan / Tahunan | — |
| Preview Nomor | Preview format sebelum simpan | — |
| Generate Nomor | Generate otomatis dari konfigurasi aktif + jaminan anti-duplikat concurrent | — |
| Aktif/Nonaktif | Toggle status di Dashboard (bukan di form create) | Toggle terikat status approval |
| Validasi 1 aktif/jenis surat | Enforce satu konfigurasi aktif per jenis surat | — |
| Approval berjenjang | **Kolom `status_approval` & `role_approver` disiapkan di DB sejak awal** (belum diaktifkan) | Workflow submit → review → approve/reject + escalation |
| Audit trail | Catat created_by/updated_by + timestamp | Riwayat approval (siapa, kapan, keputusan) |

**Out of Scope**

* **Penomoran dari sistem eksternal / Bridging BPJS-VClaim** — nomor **SEP**, **Surat Kontrol BPJS**, **SPRI BPJS**, **Rujukan BPJS**, dan nomor referensi lain yang diterbitkan sistem eksternal. Semua ini memakai nomor **response** layanan eksternal, **bukan** master ini (ditegaskan: OUT).
* Digital Signature / tanda tangan elektronik surat.
* Template isi/konten surat (layout dokumen).
* Approval workflow **atas isi surat** (approval di modul ini hanya untuk perubahan konfigurasi penomoran, Phase 2).
* Penomoran dokumen selain surat (mis. nomor rekam medis, nomor invoice) — di luar modul ini.
* OCR / import format nomor dari dokumen scan.

## 5. Related Features

Modul ini menjadi **penyedia nomor** bagi seluruh modul pembuatan surat internal. Relasi:

| Kode/Modul | Relasi Teknis/Bisnis |
|------------|----------------------|
| Surat Kontrol Rawat Jalan (internal) | Saat surat kontrol diterbitkan, memanggil `generateLetterNumber(letter_type=SURAT_KONTROL_RJ)` untuk memperoleh nomor. |
| Surat Perintah Rawat Inap (SPRI internal) | Memanggil generate nomor jenis `SPRI_INTERNAL` (BEDAKAN dari SPRI BPJS yang eksternal). |
| Surat Rujukan ke RS Lain (internal) | Generate nomor jenis `RUJUKAN_RS_LAIN`. |
| Surat Rujuk Balik FKTP PRB / Non-PRB | Generate nomor jenis `RUJUK_BALIK_PRB` / `RUJUK_BALIK_NON_PRB`. |
| Surat Keterangan Dokter | Generate nomor jenis `KETERANGAN_DOKTER`. |
| Surat Keterangan Kematian | Generate nomor jenis `KETERANGAN_KEMATIAN`. |
| Master Unit / Poli | Sumber nilai placeholder `{UNIT}` (kode unit penerbit). [PERLU KONFIRMASI kode unit yang dipakai] |
| Manajemen User / Role | Sumber `role_approver` untuk approval Phase 2 + audit created_by/updated_by. |

**Pemisahan tegas dari Bridging BPJS (bukan relasi konsumen master ini):**

* **Bridging BPJS / VClaim** (SEP, Surat Kontrol BPJS, SPRI BPJS, Rujukan BPJS) **TIDAK** memanggil master ini. Nomornya berasal dari **response** VClaim. Modul pembuatan surat harus melakukan pengecekan sumber: jika dokumen bersumber eksternal → **skip** master penomoran, simpan nomor dari response.

## 6. Business Process & User Stories

**State Machine Table — Konfigurasi Penomoran (`letter_numbering_config`)**

| Status | Deskripsi | Efek | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|------|--------------------|--------------------|
| AKTIF | Konfigurasi berlaku & dipakai untuk generate nomor jenis surat tsb | Menjadi satu-satunya sumber format nomor untuk jenis surat ini | → NONAKTIF (toggle di Dashboard) | → NONAKTIF; perubahan konfigurasi masuk `DRAFT_APPROVAL` |
| NONAKTIF | Konfigurasi ada tapi tidak dipakai | Generate nomor untuk jenis surat ini ditolak jika tak ada konfigurasi aktif lain | → AKTIF (jika belum ada konfigurasi aktif lain utk jenis yg sama) | → PENDING_APPROVAL saat diajukan aktif |
| DRAFT_APPROVAL | (Phase 2) Perubahan dibuat, belum diajukan | Tidak memengaruhi generate | — (tidak ada di Phase 1) | → PENDING_APPROVAL (submit) |
| PENDING_APPROVAL | (Phase 2) Menunggu keputusan approver | Tidak memengaruhi generate hingga disetujui | — | → AKTIF (approved) / → REJECTED (rejected) |
| REJECTED | (Phase 2) Perubahan ditolak | Kembali ke konfigurasi sebelumnya | — | → DRAFT_APPROVAL (revisi) |

> Catatan Phase 1: hanya **AKTIF** dan **NONAKTIF** yang berlaku. Kolom `status_approval` sudah ada di DB namun default `APPROVED`/`N/A` agar siap Phase 2.

**Aturan status pada create:** Status **tidak** diinput di form create — konfigurasi baru selalu **AKTIF** oleh sistem (dengan enforcement BR-01: bila sudah ada yang aktif untuk jenis surat yang sama, lihat BR-01). Pengaktifan/penonaktifan berikutnya lewat **toggle di Dashboard**.

**User Stories Utama**

* **US-01** — Sebagai **Administrator SIMRS**, saya ingin menambah konfigurasi penomoran untuk sebuah jenis surat, agar surat tersebut punya format nomor standar tanpa minta bantuan developer.
* **US-02** — Sebagai **Administrator**, saya ingin menyusun format nomor memakai placeholder (Running Number, Bulan, Tahun, Unit, Prefix) + prefix/suffix + padding, agar format sesuai kebijakan RS.
* **US-03** — Sebagai **Administrator**, saya ingin melihat **preview** nomor sebelum menyimpan, agar yakin format sudah benar.
* **US-04** — Sebagai **Administrator**, saya ingin memilih metode reset (Tidak Reset/Bulanan/Tahunan), agar penomoran mengikuti siklus periode yang diinginkan.
* **US-05** — Sebagai **Administrator**, saya ingin mengaktifkan/menonaktifkan konfigurasi dari Dashboard, agar bisa mengganti aturan tanpa menghapus data.
* **US-06** — Sebagai **Sistem/Modul Surat**, saya ingin memperoleh nomor unik dari konfigurasi aktif saat surat diterbitkan, agar tidak terjadi duplikasi meski penerbitan bersamaan.
* **US-07** — Sebagai **Sistem**, saya ingin mengecek sumber penomoran (internal vs eksternal) sebelum generate, agar dokumen bersumber BPJS memakai nomor response eksternal dan tidak ditimpa.
* **US-08** — Sebagai **Administrator**, saya ingin sistem menolak penerbitan surat jika konfigurasi jenis surat belum ada/aktif, agar tidak ada surat tanpa nomor sah.
* **US-09** — (Phase 2) Sebagai **Approver**, saya ingin menyetujui/menolak perubahan konfigurasi penomoran, agar perubahan terkontrol berjenjang.

## 7. Functional Requirements

### 7.1 Feature Requirements & Acceptance Criteria

**Fitur: FR-01 — Tambah Konfigurasi Penomoran (Create)**
* **User Story**: US-01
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin memilih **jenis surat** dari daftar; jika jenis surat sudah punya konfigurasi **AKTIF**, sistem menolak simpan sebagai aktif dan menampilkan pesan (BR-01).
    * **AC 2**: Field wajib: jenis surat, format template, padding digit, metode reset. Prefix/suffix opsional.
    * **AC 3**: Status **tidak** diinput; konfigurasi baru tersimpan sebagai **AKTIF** oleh sistem.
    * **AC 4**: Setelah simpan, sequence untuk konfigurasi ini diinisialisasi (current_number = 0) untuk periode berjalan.
    * **AC 5**: created_by & created_at terisi otomatis.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Jenis Surat | Dropdown | Required, unik-aktif | "Jenis surat wajib dipilih" / "Jenis surat ini sudah memiliki konfigurasi aktif" | "Pilih jenis surat internal yang akan diatur penomorannya" |
  | Format Template | Text | Required, wajib memuat placeholder `{RUNNING}`, placeholder valid saja | "Format wajib diisi dan harus memuat {RUNNING}" | "Contoh: {PREFIX}/{UNIT}/{RUNNING}/{MONTH}/{YEAR}" |
  | Prefix | Text | Optional, Max 20, alfanumerik + `/-.` | "Prefix maksimal 20 karakter" | "Teks awal nomor, mis. RSUD" |
  | Suffix | Text | Optional, Max 20 | "Suffix maksimal 20 karakter" | "Teks akhir nomor (opsional)" |
  | Padding Digit | Number | Required, 1–10 | "Padding harus 1 sampai 10" | "Jumlah digit running number, mis. 4 → 0001" |
  | Metode Reset | Dropdown | Required, salah satu: Tidak Reset/Bulanan/Tahunan | "Metode reset wajib dipilih" | "Kapan running number kembali ke 1" |

---

**Fitur: FR-02 — Konfigurasi Format via Placeholder**
* **User Story**: US-02
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Placeholder didukung: `{RUNNING}`, `{MONTH}`, `{YEAR}`, `{YEAR2}` (2 digit), `{UNIT}`, `{PREFIX}`. Placeholder tak dikenal ditolak saat validasi.
    * **AC 2**: `{RUNNING}` di-render dengan padding sesuai konfigurasi (mis. padding 4, nilai 7 → `0007`).
    * **AC 3**: `{MONTH}` = 2 digit (01–12), `{YEAR}` = 4 digit, `{YEAR2}` = 2 digit, mengikuti tanggal penerbitan.
    * **AC 4**: `{UNIT}` diisi dari kode unit penerbit surat saat generate; jika tidak tersedia → `[PERLU KONFIRMASI perilaku default UNIT]`.
    * **AC 5**: Prefix & suffix ikut dirangkai jika placeholder `{PREFIX}` tidak dipakai dalam template maka prefix diletakkan sesuai aturan (lihat BR-05).

---

**Fitur: FR-03 — Preview Nomor**
* **User Story**: US-03
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Saat admin mengubah format/prefix/suffix/padding/reset, preview ter-update **real-time** (client-side) tanpa menyimpan.
    * **AC 2**: Preview memakai running number contoh = (current_number periode berjalan + 1); jika belum ada = 1.
    * **AC 3**: Preview menampilkan nomor lengkap persis seperti hasil generate pertama pada periode berjalan.

---

**Fitur: FR-04 — Metode Reset Running Number**
* **User Story**: US-04
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: **Tidak Reset** → running number terus bertambah lintas bulan/tahun (period_key konstan, mis. `GLOBAL`).
    * **AC 2**: **Bulanan** → saat generate pertama di bulan baru (period_key `YYYY-MM` berubah), running number mulai dari 1.
    * **AC 3**: **Tahunan** → saat generate pertama di tahun baru (period_key `YYYY` berubah), running number mulai dari 1.
    * **AC 4**: Reset **tidak** menghapus riwayat sequence periode sebelumnya (audit tetap ada).
    * **AC 5** (uji reset): Set metode Bulanan, generate di 31 bulan-N lalu generate di 1 bulan-(N+1) → nomor kembali ke `0001` (padding 4).

---

**Fitur: FR-05 — Generate Nomor Otomatis (Anti-Duplikat)**
* **User Story**: US-06, US-08
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Modul surat memanggil generate dengan `letter_type`; sistem mengambil konfigurasi **AKTIF** jenis tsb.
    * **AC 2**: Jika tidak ada konfigurasi aktif untuk jenis surat → generate **ditolak** dengan pesan, surat tidak boleh terbit (BR-02).
    * **AC 3**: Increment running number bersifat **atomik** (transaksi + row lock / `UPDATE ... RETURNING` / unique constraint) sehingga **tidak ada nomor duplikat** meski request bersamaan.
    * **AC 4** (uji concurrent): 50 request generate bersamaan untuk 1 jenis surat menghasilkan 50 nomor **berurutan & unik**, tanpa gap tak sengaja dan tanpa duplikat.
    * **AC 5**: Running number hanya bertambah bila surat **berhasil** diterbitkan (commit); rollback saat gagal tidak boleh menyisakan nomor "terpakai ganda" — [ASUMSI] strategi: increment saat commit penerbitan.

---

**Fitur: FR-06 — Pengecekan Sumber Penomoran (Internal vs Eksternal)**
* **User Story**: US-07
* **Prioritas**: P0
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Sebelum generate, sistem menentukan sumber dokumen: **internal SIMRS** vs **eksternal (Bridging BPJS/VClaim)**.
    * **AC 2**: Jika **internal** → generate dari Master Penomoran Surat.
    * **AC 3**: Jika **eksternal** → **tidak** generate; simpan & tampilkan nomor dari **response** layanan eksternal.
    * **AC 4**: Master ini **tidak boleh** menimpa/mengubah nomor referensi resmi BPJS/pihak ketiga (BR-06).

---

**Fitur: FR-07 — Aktif/Nonaktif (Toggle di Dashboard)**
* **User Story**: US-05
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Toggle status dilakukan dari **Dashboard/List**, bukan form create.
    * **AC 2**: Mengaktifkan sebuah konfigurasi ditolak bila jenis surat yang sama sudah punya konfigurasi AKTIF (BR-01).
    * **AC 3**: Menonaktifkan konfigurasi tidak menghapus data & sequence-nya.
    * **AC 4**: updated_by & updated_at terisi saat toggle.

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | Toggle Status | Switch | Enforce 1 aktif/jenis surat | "Sudah ada konfigurasi aktif untuk jenis surat ini. Nonaktifkan dulu yang lama." | "Aktifkan untuk mulai memakai konfigurasi ini" |

---

**Fitur: FR-08 — Edit Konfigurasi**
* **User Story**: US-02
* **Prioritas**: P1
* **Fase**: Phase 1
* **Acceptance Criteria**:
    * **AC 1**: Admin dapat mengubah format/prefix/suffix/padding/metode reset.
    * **AC 2**: Perubahan **padding** hanya memengaruhi nomor yang digenerate **setelah** perubahan; nomor lama tidak berubah.
    * **AC 3**: Mengubah **metode reset** tidak me-reset current_number periode berjalan secara surut; berlaku pada evaluasi periode berikutnya. [ASUMSI]
    * **AC 4**: (Phase 2) Perubahan masuk alur approval sebelum berlaku.

---

**Fitur: FR-09 — (Phase 2) Approval Berjenjang Perubahan Konfigurasi**
* **User Story**: US-09
* **Prioritas**: P2
* **Fase**: Phase 2
* **Acceptance Criteria**:
    * **AC 1**: Perubahan/aktivasi konfigurasi berstatus PENDING_APPROVAL hingga disetujui `role_approver`.
    * **AC 2**: Approver dapat approve/reject dengan catatan; keputusan tercatat (siapa, kapan).
    * **AC 3**: Hanya konfigurasi berstatus APPROVED + AKTIF yang dipakai generate.

## 8. Data & Technical Specifications

### 8.1 Database Schema Suggestion

**Table Name**: `letter_numbering_config` — konfigurasi penomoran per jenis surat.

* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `letter_type_code`: VARCHAR — kode jenis surat (mis. `SURAT_KONTROL_RJ`, `SPRI_INTERNAL`, `RUJUKAN_RS_LAIN`, `RUJUK_BALIK_PRB`, `RUJUK_BALIK_NON_PRB`, `KETERANGAN_DOKTER`, `KETERANGAN_KEMATIAN`)
    * `letter_type_name`: VARCHAR — nama tampil jenis surat
    * `format_template`: VARCHAR — template placeholder, mis. `{PREFIX}/{UNIT}/{RUNNING}/{MONTH}/{YEAR}`
    * `prefix`: VARCHAR(20), nullable
    * `suffix`: VARCHAR(20), nullable
    * `running_number_padding`: SMALLINT (1–10, default 4)
    * `reset_method`: ENUM(`NONE`,`MONTHLY`,`YEARLY`) — Tidak Reset / Bulanan / Tahunan
    * `unit_code`: VARCHAR, nullable — default nilai `{UNIT}` bila tidak dikirim modul surat [PERLU KONFIRMASI]
    * `is_active`: BOOLEAN (default true)
    * `status_approval`: ENUM(`APPROVED`,`DRAFT_APPROVAL`,`PENDING_APPROVAL`,`REJECTED`) default `APPROVED` — **disiapkan untuk Phase 2**
    * `role_approver`: VARCHAR, nullable — **disiapkan untuk Phase 2**
    * `created_by`, `updated_by`: UUID/VARCHAR
    * `created_at`, `updated_at`: TIMESTAMP
* **Constraint**:
    * **Partial unique index**: unik pada `letter_type_code` dengan kondisi `is_active = true` → **enforce 1 konfigurasi aktif per jenis surat** (BR-01) di level DB.

**Table Name**: `letter_number_sequence` — state counter per konfigurasi per periode (untuk atomic increment & reset).

* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `config_id`: UUID (FK → `letter_numbering_config.id`)
    * `period_key`: VARCHAR — `GLOBAL` (NONE), `YYYY` (YEARLY), atau `YYYY-MM` (MONTHLY)
    * `current_number`: BIGINT (default 0)
    * `updated_at`: TIMESTAMP
* **Constraint**:
    * **Unique(`config_id`, `period_key`)** — kunci anti-duplikat; increment via `INSERT ... ON CONFLICT DO UPDATE SET current_number = current_number + 1 RETURNING current_number` (atomik).

**Table Name (Phase 2)**: `letter_numbering_config_approval` — riwayat approval perubahan (id, config_id, action, decision, approver_id, note, decided_at). [ASUMSI struktur Phase 2]

### 8.2 API Endpoint Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/letter-numbering-configs` | List konfigurasi (filter jenis surat, status) |
| GET | `/api/v1/letter-numbering-configs/{id}` | Detail satu konfigurasi |
| POST | `/api/v1/letter-numbering-configs` | Create konfigurasi (status default AKTIF) |
| PUT | `/api/v1/letter-numbering-configs/{id}` | Update konfigurasi |
| PATCH | `/api/v1/letter-numbering-configs/{id}/status` | Toggle Aktif/Nonaktif (Dashboard) |
| DELETE | `/api/v1/letter-numbering-configs/{id}` | Hapus/soft-delete konfigurasi |
| POST | `/api/v1/letter-numbering-configs/preview` | Preview nomor dari payload konfigurasi (tanpa simpan) |
| POST | `/api/v1/letter-numbers/generate` | Generate nomor untuk `letter_type` (dipakai modul surat; atomik) |
| GET | `/api/v1/letter-types` | Master jenis surat internal (untuk dropdown) |
| POST | `/api/v1/letter-numbering-configs/{id}/submit-approval` | (Phase 2) Ajukan perubahan ke approval |
| POST | `/api/v1/letter-numbering-configs/{id}/decide` | (Phase 2) Approve/Reject |

### 8.3 Data & Business Rules

#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)

| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| letter_type_code | Jenis Surat | Dropdown | Ya | Harus dari master jenis surat; unik untuk yang aktif | `GET /letter-types` | Hanya surat internal SIMRS |
| format_template | Format Nomor | Text/Builder | Ya | Wajib memuat `{RUNNING}`; hanya placeholder valid | Input admin | Contoh: `{PREFIX}/{UNIT}/{RUNNING}/{MONTH}/{YEAR}` |
| prefix | Prefix | Text | Tidak | Max 20, alfanumerik + `/-.` | Input admin | Mis. `RSUD` |
| suffix | Suffix | Text | Tidak | Max 20 | Input admin | Opsional |
| running_number_padding | Digit Running Number | Number | Ya | 1–10 | Input admin | 4 → `0001` |
| reset_method | Metode Reset | Dropdown | Ya | Salah satu: Tidak Reset/Bulanan/Tahunan | Statik | Menentukan `period_key` |
| unit_code | Unit Default | Dropdown | Tidak | Harus dari master unit bila diisi | Master Unit | Untuk `{UNIT}` bila modul surat tak mengirim [PERLU KONFIRMASI] |
| is_active | Status | (tidak di form create) | — | Selalu AKTIF saat create; toggle di Dashboard | Sistem | Sesuai aturan template: status tidak diinput saat create |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)

| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| Jenis Surat | letter_type_name | Teks | Filter by jenis; sort A–Z | — |
| Format Nomor | format_template | Teks monospace | — | Tampilkan pola placeholder |
| Contoh Nomor | hasil preview periode berjalan | Teks | — | Nomor berikutnya yang akan digenerate |
| Metode Reset | reset_method | Badge (Tidak Reset/Bulanan/Tahunan) | Filter | — |
| Running Saat Ini | sequence.current_number | Angka | Sort | Per periode berjalan |
| Status | is_active | Badge Aktif/Nonaktif + Toggle | Filter status | Toggle di sini (bukan create) |
| Terakhir Diubah | updated_at + updated_by | Tanggal + nama | Sort desc | Audit |

**Business Rules**

* **BR-01 (1 aktif per jenis surat)**: Setiap `letter_type_code` boleh punya **tepat satu** konfigurasi `is_active = true`. Di-enforce lewat **partial unique index** DB + validasi aplikasi. Mengaktifkan konfigurasi baru saat sudah ada yang aktif → ditolak (nonaktifkan dulu yang lama). Ini juga alasan **status tidak diinput di form create** — sistem set AKTIF, lalu validasi BR-01.
* **BR-02 (tidak ada surat tanpa nomor)**: Jika jenis surat belum punya konfigurasi AKTIF, penerbitan surat **ditolak** dan admin diminta melengkapi konfigurasi.
* **BR-03 (anti-duplikat concurrent)**: Perolehan nomor memakai **increment atomik** pada `letter_number_sequence` (unique `config_id`+`period_key` + `ON CONFLICT DO UPDATE ... RETURNING` / row lock). Dua request bersamaan **tidak boleh** memperoleh nomor sama.
* **BR-04 (reset per periode)**: `period_key` = `GLOBAL` (NONE) / `YYYY` (YEARLY) / `YYYY-MM` (MONTHLY). Periode baru → baris sequence baru dengan current_number mulai 1.
* **BR-05 (perangkaian format)**: Nomor akhir = template dengan placeholder tersubstitusi; `{RUNNING}` dipad sesuai padding. Bila `{PREFIX}`/prefix & suffix dipakai, urutan: `prefix` + template + `suffix` (kecuali `{PREFIX}` sudah eksplisit di template). [ASUMSI perangkaian]
* **BR-06 (sumber penomoran)**: Sebelum generate, cek sumber. **Internal** → pakai master ini. **Eksternal (Bridging BPJS/VClaim: SEP, Surat Kontrol BPJS, SPRI BPJS, Rujukan BPJS)** → **tidak** generate, pakai nomor **response** eksternal; master ini **tidak boleh** menimpa nomor resmi eksternal.
* **BR-07 (audit)**: Semua create/update/toggle mencatat aktor & waktu.

## 9. Workflow / BPMN Interpretation

> BPMN resmi tidak tersedia untuk modul ini. Alur berikut adalah **[ASUMSI]** interpretasi System Analyst berdasarkan draft sumber & aturan bisnis.

**A. Alur Konfigurasi (Admin) — Phase 1**
1. Admin buka menu **Master Penomoran Surat** (Control Panel).
2. Klik **Tambah** → pilih **jenis surat** (internal).
3. Susun **format** (placeholder) + prefix/suffix + padding + metode reset.
4. Lihat **preview** nomor (real-time).
5. **Simpan** → sistem set status **AKTIF**; validasi **BR-01** (tolak bila jenis surat sudah punya konfigurasi aktif) → inisialisasi sequence.
6. Kelola aktif/nonaktif via **toggle di Dashboard**.
7. (Phase 2) Perubahan → submit approval → approver approve/reject → berlaku bila approved.

**B. Alur Generate Nomor (saat surat diterbitkan) — dengan cek sumber internal vs eksternal**
1. Modul surat memicu penerbitan surat dengan konteks dokumen.
2. **Cek sumber penomoran** (BR-06):
   * **Eksternal (Bridging BPJS/VClaim)** → **tidak** generate; ambil & simpan nomor dari **response** layanan eksternal (SEP/Surat Kontrol BPJS/SPRI BPJS/Rujukan BPJS). Selesai.
   * **Internal SIMRS** → lanjut ke langkah 3.
3. Ambil konfigurasi **AKTIF** untuk `letter_type`. Bila tidak ada → **tolak** penerbitan (BR-02).
4. Tentukan `period_key` dari metode reset + tanggal penerbitan.
5. **Increment atomik** current_number pada `letter_number_sequence` (BR-03) → dapat running number unik.
6. Substitusi placeholder → rakit nomor final (padding, prefix/suffix) (BR-05).
7. Simpan nomor pada surat saat penerbitan **commit** (running number naik hanya bila sukses).
8. Kembalikan nomor ke modul surat untuk dicetak/disimpan.

**Diagram alur ringkas (teks):**
`Terbitkan Surat → [Sumber?] --Eksternal--> pakai nomor response (stop) | --Internal--> [Konfigurasi aktif?] --Tidak--> tolak (stop) | --Ya--> tentukan period_key → increment atomik → rakit format → commit → nomor`

## Asumsi

- [ASUMSI] Increment running number dilakukan saat penerbitan surat berhasil commit, sehingga rollback tidak menyisakan nomor terpakai ganda.
- [ASUMSI] Placeholder yang didukung: {RUNNING}, {MONTH}, {YEAR}, {YEAR2}, {UNIT}, {PREFIX}; dapat diperluas sesuai kebutuhan.
- [ASUMSI] Anti-duplikat concurrent diimplementasikan via unique(config_id, period_key) + increment atomik (ON CONFLICT DO UPDATE ... RETURNING) atau row lock pada DB relasional.
- [ASUMSI] period_key: GLOBAL (Tidak Reset), YYYY (Tahunan), YYYY-MM (Bulanan) berbasis tanggal penerbitan (kalender).
- [ASUMSI] Kolom status_approval & role_approver disiapkan sejak Phase 1 (default APPROVED) agar arsitektur siap approval Phase 2 tanpa migrasi besar.
- [ASUMSI] BPMN resmi tidak tersedia; alur workflow di Bagian 9 adalah interpretasi analis.
- [ASUMSI] Perubahan padding hanya berlaku untuk nomor yang digenerate setelah perubahan; nomor historis tidak diubah.

## Pertanyaan Terbuka

- Bagaimana perilaku default placeholder {UNIT} bila modul surat tidak mengirim kode unit penerbit? Pakai unit_code default konfigurasi, kosong, atau tolak? [PERLU KONFIRMASI]
- Apakah running number boleh 'lompat' (gap) saat penerbitan surat gagal/rollback, atau harus benar-benar berurutan tanpa gap? Ini memengaruhi strategi increment (saat mulai vs saat commit).
- Daftar final kode jenis surat internal (letter_type_code) dan pemetaannya — perlu dikonfirmasi lengkap oleh tim RS/Rekam Medis.
- Untuk Phase 2, siapa saja role approver dan berapa jenjang approval yang dibutuhkan?
- Apakah perlu format {YEAR} berbasis tahun fiskal/anggaran RS, bukan tahun kalender? [PERLU KONFIRMASI]
- Apakah prefix/suffix dan pemisah (separator) boleh berbeda per placeholder, atau cukup diatur penuh lewat format_template?