# PRD — General Consent Rawat Jalan

**Related Document:** PRD Pendaftaran RJ — Data Sosial *(hard dependency)*; Print Out General Consent — Format Syariah *(template cetak)*; Desain Figma
**Dokumen ID:** PRD-P-GC-RJ-v2.0 `[ASUMSI penomoran mengikuti konvensi PRD Neurovi v2]`  ·  **Versi:** 1.0 (Draft awal General Consent — dikonversi ke format generator)
**Tanggal Disusun:** 30 Juni 2026 · **Penyusun:** Team Product — Tamtech International · **PIC:** Elfira (System Analyst)
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI — belum tercantum di sumber]`
**Status:** Untuk Direview · **Target Release:** Fase 1 (Phase 1) `[PERLU KONFIRMASI — kuartal belum ditetapkan]`

---

## 1. Overview / Brief Summary

General Consent Rawat Jalan adalah persetujuan umum yang diisi pasien (atau wali) saat awal berhubungan dengan rumah sakit, mencakup identitas penandatangan, persetujuan pelepasan informasi ke pihak tertentu, dan preferensi privasi pasien. Modul ini dipakai petugas pendaftaran dari dashboard Pendaftaran RJ dalam konteks satu pasien.

Di **Neurovi v1**, form ini sudah berjalan: data identitas terisi otomatis dari data sosial, dua bagian persetujuan (pelepasan informasi & privasi) muncul secara kondisional, dan dokumen baru bisa dicetak setelah disimpan. Keterbatasannya, general consent yang sudah tersimpan tidak bisa diperbarui dan tidak menyimpan riwayat.

Di **Neurovi v2**, form dirapikan tampilannya dan ditambah kemampuan memperbarui general consent dengan menyimpan versi baru sekaligus mengarsipkan versi lama (log history), sehingga jejak persetujuan tetap ada. Alur cetak menghasilkan PDF yang diunduh untuk ditandatangani basah oleh pasien/wali, dengan teks pernyataan yang dapat diatur masing-masing rumah sakit. General consent tetap berlaku sekali seumur hidup pasien (tanpa kadaluarsa); pembaruan hanya dilakukan bila isinya memang perlu diubah.

**Penegasan lingkup Fase 1 MVP:** hanya General Consent Rawat Jalan; cetak menggunakan Format Syariah; tanda tangan dilakukan basah pada hasil cetak. Format General `[**]`, integrasi SATUSEHAT Consent `[**]`, dan General Consent RI/IGD `[**]` berada di luar lingkup Fase 1.

> Referensi: PRD Pendaftaran RJ — Data Sosial; Print Out General Consent — Format Syariah; Desain Figma.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Form general consent rawat jalan diakses dari dashboard Pendaftaran RJ.
- Saat pertama kali dibuka, sebagian field terisi otomatis dari data sosial.
- Bagian persetujuan pelepasan informasi dan privasi default-nya "Tidak". Bila dipilih "Ya", field tambahan muncul (Nama + Hubungan untuk pelepasan informasi; Nama untuk privasi).
- Ada header data sosial pasien (No. RM, Nama, Tanggal Lahir + Umur).
- Tombol Print dan Simpan. Sebelum disimpan, tombol Print nonaktif; setelah disimpan, tombol Print aktif dan dokumen bisa dicetak.
- Belum bisa memperbarui general consent yang sudah tersimpan.
- Belum ada riwayat bila data diubah — tidak ada jejak versi lama.

**Masalah/pain point:**
- Aspek bisnis proses: consent yang salah/berubah tidak bisa diperbaiki tanpa membuat data baru, dan tidak ada jejak versi untuk kebutuhan medico-legal.
- Aspek UX: tampilan v1 belum rapi; tidak ada mode Lihat yang jelas untuk consent yang sudah ada.
- Aspek logic system: tidak ada mekanisme versioning/arsip; tidak ada audit trail.

**Dampak utama yang disasar v2:**
- Consent dapat diperbarui tanpa kehilangan jejak versi lama (log history) · Kepatuhan medico-legal terjaga · Proses pengisian tetap cepat & sederhana seperti v1.

**Strategi rilis Neurovi v2:**
- **Fase 1 (MVP)** = General Consent Rawat Jalan penuh (buat, lihat, update/versioning, cetak PDF Format Syariah, audit trail DB).
- **Fase 2** = Format General untuk cetak `[**]`; integrasi SATUSEHAT Consent `[**]`; General Consent RI/IGD `[**]`; tanda tangan digital / e-signature `[**]`.

> Target perbaikan v2: tampilan dirapikan; consent dapat diperbarui dengan tombol yang berubah menjadi Update setelah disimpan; form tidak bisa diedit sampai Update ditekan; setiap pembaruan menyimpan versi baru dan mengarsipkan versi lama; cetak menghasilkan PDF yang diunduh dengan teks pernyataan yang bisa diatur per rumah sakit. Perilaku inti lain (autofill data sosial, dua persetujuan kondisional, Print aktif setelah simpan) dipertahankan sesuai v1.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. **Entry point form General Consent** dari dashboard Pendaftaran RJ, dengan deteksi otomatis: pasien belum punya consent → mode **Buat Baru**; sudah punya → mode **Lihat/Update** (menampilkan versi aktif, read-only).
2. **Header identitas pasien** (data sosial) — hanya tampil.
3. **Section Identitas Penandatangan**: pilihan Pasien/Wali (default Pasien) + autofill Nama, Alamat, No. Telp, No. Identitas dari data sosial. Field tetap dapat diedit manual.
4. **Section Persetujuan Pelepasan Informasi** (Ya/Tidak, default Tidak). Bila Ya, muncul baris Nama + Hubungan yang dinamis (tambah/hapus baris).
5. **Section Privasi / Izin Dijenguk** (Ya/Tidak, default Tidak). Bila Ya, muncul baris nama orang yang tidak diberi izin menjenguk, dinamis (tambah/hapus baris).
6. **Simpan (buat versi pertama)** < 1 detik. Setelah simpan: tombol berubah jadi Update, form menjadi read-only, tombol Print aktif.
7. **Update**: dari mode Lihat (read-only), klik Update → form menjadi editable, tombol kembali jadi Simpan, tombol Print nonaktif sampai disimpan ulang. Simpan menghasilkan versi baru dan mengarsipkan versi lama.
8. **Cetak PDF general consent** untuk diunduh (tanda tangan basah) dari template teks pernyataan per tenant. Print nonaktif sebelum disimpan. < 1 detik. *Catatan: untuk cetak akan ada config Format Syariah dan Format General; namun yang dikembangkan pada fase ini adalah **Format Syariah**.*
9. **Audit trail di database** (siapa, kapan, action, before/after). Tidak ditampilkan ke user di form.

### Out Scope
- General Consent RI/IGD. `[**]`
- Integrasi SATUSEHAT Consent. `[**]`
- Tanda tangan digital / e-signature — penandatanganan dilakukan basah pada hasil cetak. `[**]`
- Format General untuk cetak (config tersedia, tidak dikembangkan Fase 1). `[**]`

## 4. Goals and Metrics

### Tujuan
- Memastikan setiap pasien baru rawat jalan memiliki general consent yang tersimpan dan dapat dicetak untuk ditandatangani.
- Memungkinkan pembaruan isi consent tanpa kehilangan jejak versi sebelumnya, demi kepatuhan medico-legal.
- Menjaga proses pengisian tetap cepat dan sederhana — sesederhana v1, dengan tampilan yang lebih rapi.

### Metrik (terukur)
| No | Metrik | Target / Success Criteria | Sumber |
|----|--------|---------------------------|--------|
| 1 | Kepatuhan general consent | 100% pasien baru RJ memiliki general consent tersimpan | Goal |
| 2 | Kecepatan simpan | Simpan general consent < 1 detik | NFR-001 |
| 3 | Kecepatan cetak | Generate PDF general consent < 1 detik | NFR-002 |
| 4 | Integritas riwayat | 100% pembaruan menghasilkan versi baru tanpa kehilangan versi lama | NFR-003 |

## 5. Related Feature

### A. Modul Terkait
| No | Modul | Fitur / Peran terhadap Modul |
|----|-------|------------------------------|
| 1 | Pendaftaran | Dashboard Pendaftaran RJ (entry point) & Data Sosial Pasien (sumber autofill + header identitas). |

Dependency lintas modul: **Data Sosial Pasien (Pendaftaran RJ)** sebagai sumber field identitas; **Template teks pernyataan per tenant** (config klien) untuk output cetak.

## 6. Business Process (As-Is / To-Be)

### A. As-Is (Neurovi v1)
1. Petugas membuka form General Consent dari dashboard Pendaftaran RJ untuk pasien baru.
2. Form terbuka; sebagian field terisi otomatis dari data sosial: Yang bertandatangan = Pasien (default), Nama, Alamat, No. Telp, No. Identitas.
3. Persetujuan Pelepasan Informasi & Privasi default Tidak.
4. Bila Pelepasan Informasi = Ya, muncul field Nama + Hubungan. Bila Privasi = Ya, muncul field Nama.
5. Petugas klik Simpan. Selama belum disimpan, tombol Print nonaktif.
6. Setelah disimpan, tombol Print aktif; petugas bisa mencetak dokumen.
7. Consent yang sudah tersimpan tidak bisa diperbarui, dan tidak ada riwayat versi.

### B. To-Be (Neurovi v2 — Fase 1 MVP)
1. Entry point sama (dashboard Pendaftaran RJ). Saat dibuka, sistem cek apakah pasien sudah punya general consent.
2. Pasien belum punya → form mode **Buat Baru** dengan autofill seperti v1.
3. Pasien sudah punya → form mode **Lihat** menampilkan versi aktif dalam keadaan read-only, dengan tombol Update.
4. Petugas isi/ubah persetujuan (kondisional, dengan baris dinamis untuk Pelepasan Informasi & Privasi).
5. Klik Simpan → tersimpan, tombol berubah jadi Update, form jadi read-only, tombol Print aktif.
6. Untuk memperbarui: klik Update → form jadi editable, tombol kembali jadi Simpan, Print nonaktif sampai disimpan ulang. Simpan ulang membuat versi baru dan mengarsipkan versi lama.
7. Cetak menghasilkan PDF yang diunduh dengan teks pernyataan sesuai pengaturan rumah sakit; ditandatangani basah lalu diarsip.

### C. Perbedaan As-Is (V1) vs To-Be (V2)
| Aspek | As-Is (V1) | To-Be (V2) |
|-------|------------|------------|
| Pembaruan consent | Tidak bisa diperbarui | Bisa diperbarui via mode Update |
| Riwayat / versi | Tidak ada jejak versi lama | Versi baru dibuat, versi lama diarsip (log history) |
| Mode form | Selalu editable saat dibuka | Deteksi mode: Buat Baru / Lihat (read-only) / Update |
| Audit trail | Tidak ada | Setiap create/update tercatat di DB |
| Cetak | PDF setelah simpan | PDF setelah simpan, teks pernyataan per tenant (Format Syariah) |

## 7. Main Flow / Mindmap

### Skenario A — Buat Baru (pasien belum punya general consent, alur normal)
1. **Buka form.** Petugas klik "General Consent" di dashboard Pendaftaran RJ. Sistem cek: pasien belum punya consent → mode Buat Baru. Form terbuka sebagai overlay/dialog dengan header identitas pasien.
2. **Autofill.** Yang bertandatangan = Pasien (default); Nama, Alamat, No. Telp, No. Identitas terisi dari data sosial. Autofill hanya dilakukan sekali pada pembuatan baru ini. Field tetap bisa diedit manual, dan perubahannya tidak menulis balik ke data sosial.
3. **Persetujuan Pelepasan Informasi.** Default Tidak. Bila petugas pilih Ya, muncul baris Nama + Hubungan (bisa tambah/hapus baris).
4. **Privasi / Izin Dijenguk.** Default Tidak. Bila petugas pilih Ya, muncul baris nama orang yang tidak diberi izin menjenguk (bisa tambah/hapus baris).
5. **Tombol Print nonaktif** selama belum disimpan.
6. **Klik Simpan.** Sistem validasi field, lalu simpan sebagai versi 1 (status aktif). Catat audit trail. Simpan < 1 detik.
   - Jika ada field wajib yang belum diisi → sistem menampilkan pesan error pada field tersebut.
7. **Setelah simpan.** Tombol berubah jadi Update, form jadi read-only, tombol Print aktif.
8. **Cetak (opsional).** Klik Print → sistem generate PDF dari template teks pernyataan tenant, berisi data consent + area tanda tangan → file diunduh → dicetak → ditandatangani basah → diarsip.

### Skenario B — Update (pasien sudah punya consent)
1. **Buka form.** Petugas klik "General Consent". Sistem cek: pasien sudah punya consent → mode Lihat, menampilkan versi aktif dalam keadaan read-only. Tombol terlihat: Update (dan Print aktif untuk versi aktif).
2. **Klik Update.** Form menjadi editable, tombol berubah jadi Simpan, tombol Print menjadi nonaktif sampai disimpan ulang. Field menampilkan nilai consent versi aktif yang tersimpan — tidak ada autofill ulang dari data sosial.
3. **Petugas ubah** isian yang perlu (identitas penandatangan, pelepasan informasi, privasi).
4. **Klik Simpan.** Sistem validasi, lalu:
   - Versi aktif sebelumnya tetap disimpan dengan timestamp & user.
   - Data baru disimpan sebagai data aktif (status aktif).
   - Catat audit trail.
   - Jika ada field wajib yang belum diisi → sistem menampilkan pesan error pada field tersebut.
5. **Setelah simpan.** Tombol kembali jadi Update, form read-only, tombol Print aktif (mencetak versi aktif yang baru).

### Skenario C — Cetak
1. Print hanya bisa diklik bila ada versi aktif yang sudah tersimpan dan form sedang tidak dalam mode edit.
2. Sistem merakit PDF: kop/identitas RS + teks pernyataan (template tenant) + data consent versi aktif + area tanda tangan (Pasien/Wali + saksi/petugas sesuai template).
3. PDF diunduh ke perangkat petugas untuk dicetak dan ditandatangani basah.

## 8. Business Rules

| ID | Rule | Sumber / Trace |
|----|------|----------------|
| **BR-001** | Form General Consent selalu dibuka dalam konteks satu pasien. | FR-001; US-001 |
| **BR-002** | General consent unik per pasien — satu pasien hanya punya satu consent aktif pada satu waktu; versi lama diarsipkan, bukan menambah consent baru. | FR-001; US-001 |
| **BR-003** | Saat form dibuka, sistem mendeteksi keberadaan consent aktif: belum ada → mode Buat Baru; sudah ada → mode Lihat (read-only). | FR-001; US-001 |
| **BR-004** | Header identitas pasien hanya tampil (read-only), bersumber dari data sosial; minimal No. RM, Nama, Tanggal Lahir (+ umur). | FR-002; US-002 |
| **BR-005** | Judul form: "Pembuatan General Consent Rawat Jalan". | FR-002; US-002 |
| **BR-006** | Pilihan Yang bertandatangan: Pasien / Wali. Default Pasien (mengikuti v1). | FR-003; US-003 |
| **BR-007** | Mengganti Pasien ↔ Wali tidak meng-clear atau menukar isi field; field tetap berisi data hasil autofill (data sosial) dan dapat diedit manual. | FR-003; US-003 |
| **BR-008** | Field Nama (penandatangan) wajib diisi. Alamat, No. Telp, No. Identitas mengikuti ketersediaan data sosial. | FR-003; FR-010; US-003 |
| **BR-009** | Field identitas penandatangan editable di mode Buat Baru & Update; read-only di mode Lihat. | FR-003; US-003 |
| **BR-010** | Persetujuan Pelepasan Informasi default Tidak (mengikuti v1). Bila Ya, muncul baris Nama + Hubungan. | FR-004; US-004 |
| **BR-011** | Field Hubungan = daftar pilih (enum). | FR-004; US-004 |
| **BR-012** | Baris Pelepasan Informasi dinamis (tambah/hapus), tanpa batas jumlah; minimal 1 baris muncul saat memilih Ya. | FR-004; US-004 |
| **BR-013** | Bila Pelepasan Informasi = Ya tetapi baris tidak terisi → tidak divalidasi saat Simpan (bersifat opsional). | FR-004; FR-010; US-004 |
| **BR-014** | Privasi / Izin Dijenguk default Tidak (mengikuti v1). Bila Ya, muncul baris nama pengecualian (pihak yang tidak diberi izin menjenguk). | FR-005; US-005 |
| **BR-015** | Baris Privasi dinamis (tambah/hapus); bila Ya, isian nama opsional — boleh dikosongkan (kosong = tidak ada pengecualian, semua boleh menjenguk). | FR-005; FR-010; US-005 |
| **BR-016** | Sebelum disimpan, tombol Print nonaktif (mengikuti v1). | FR-006; US-006 |
| **BR-017** | Simpan pertama menyimpan sebagai versi 1 (status aktif); setelah simpan, tombol berubah jadi Update, form read-only, Print aktif. | FR-006; US-006 |
| **BR-018** | Bila validasi gagal saat Simpan → tampilkan pesan, data tidak disimpan. | FR-006; FR-010; US-006 |
| **BR-019** | Klik Update mengubah form ke editable, tombol jadi Simpan, dan Print nonaktif hingga disimpan ulang. | FR-007; US-007 |
| **BR-020** | Setiap Simpan di mode Update menghasilkan versi baru dan mengarsipkan versi lama (tidak menimpa versi lama). | FR-007; US-007 |
| **BR-021** | Versi yang dicetak & ditampilkan selalu versi aktif (terbaru). | FR-007; FR-008; US-007 |
| **BR-022** | Pembaruan consent tidak dibatasi waktu — consent berlaku seumur hidup, pembaruan hanya dilakukan bila isinya memang perlu diubah. | FR-007; US-007 |
| **BR-023** | Print aktif hanya bila ada versi aktif tersimpan dan form tidak dalam mode edit. | FR-008; US-008 |
| **BR-024** | Output cetak = PDF yang diunduh. Tidak ada cetak langsung ke printer dari sistem dan tidak ada tanda tangan digital di Phase 1. | FR-008; US-008 |
| **BR-025** | Teks pernyataan pada output cetak dapat diatur per rumah sakit (config tenant); yang dikustomisasi adalah teks di output cetak. | FR-008; US-008 |
| **BR-026** | Cetak PDF Phase 1 menggunakan **Format Syariah**. Format General tersedia sebagai config namun tidak dikembangkan pada fase ini. `[**]` | Scope Definition |
| **BR-027** | Setiap aksi Simpan (create/update) mencatat entri audit di database. | FR-009; US-009 |
| **BR-028** | Audit trail mencatat: timestamp commit, user_id, user_name (snapshot), action_type (CREATE_CONSENT / UPDATE_CONSENT), pasien_id, versi, before_value (untuk update), after_value, ip_address, user_agent. Tidak ditampilkan ke user (investigasi via DB pada Phase 1). | FR-009; US-009 |
| **BR-029** | Autofill identitas penandatangan dari data sosial hanya terjadi **sekali**, yaitu saat pembuatan general consent baru (mode Buat Baru). | FR-003; US-003 |
| **BR-030** | Setelah general consent tersimpan, saat mode Update sistem **tidak melakukan autofill ulang** dari data sosial; field menampilkan nilai yang tersimpan pada consent versi aktif dan dapat diubah manual. | FR-003, FR-007; US-003, US-007 |
| **BR-031** | Perubahan data pada general consent bersifat **satu arah** — mengubah field di general consent tidak menulis balik / mengubah data sosial pasien. | FR-003; US-003 |

## 9. State Machine

### 9.1 State Mode Form
| State | Kondisi Field | Tombol | Print |
|-------|---------------|--------|-------|
| **Buat Baru** | Editable, terisi autofill data sosial (sekali) | Simpan | Nonaktif |
| **Lihat** | Read-only (menampilkan versi aktif) | Update | Aktif |
| **Update (Edit)** | Editable, menampilkan nilai tersimpan (tanpa autofill ulang) | Simpan | Nonaktif |

- **Autofill** hanya pada transisi menuju **Buat Baru** (BR-029); pada **Update (Edit)** field diisi dari consent versi aktif, bukan data sosial (BR-030). Perubahan di consent tidak menulis balik ke data sosial (BR-031).

- **Transisi:** Buat Baru → *(Simpan)* → Lihat → *(Update)* → Update (Edit) → *(Simpan)* → Lihat. (Berbasis aksi user: Simpan / Update.)
- Print hanya aktif pada state **Lihat** (ada versi aktif tersimpan & form tidak dalam mode edit) — BR-023.

### 9.2 State Versi Consent
| State | Makna |
|-------|-------|
| **Aktif** | Versi terbaru yang berlaku; satu-satunya versi aktif per pasien (BR-002). Versi yang ditampilkan & dicetak (BR-021). |
| **Arsip** | Versi lama yang tergantikan setelah Update; tetap tersimpan dengan timestamp & user (BR-020). Tidak hilang. |

- Setiap Simpan di mode Update: versi Aktif sebelumnya → Arsip; data baru → Aktif (BR-020).

## 10. Functional Requirements

| ID | Functional Requirement | Trace |
|----|------------------------|-------|
| **FR-001** | **Deteksi mode form** — saat dibuka dalam konteks satu pasien, sistem mengecek keberadaan consent aktif dan mengarahkan ke mode Buat Baru (belum ada) atau Lihat/read-only (sudah ada). | US-001; BR-001, BR-002, BR-003 |
| **FR-002** | **Header identitas pasien** — menampilkan No. RM, Nama, Tanggal Lahir + umur dari data sosial, read-only, dengan judul form "Pembuatan General Consent Rawat Jalan". | US-002; BR-004, BR-005 |
| **FR-003** | **Identitas penandatangan** — autofill Nama, Alamat, No. Telp, No. Identitas dari data sosial **sekali** saat mode Buat Baru; pilihan Pasien/Wali (default Pasien); field editable manual di mode Buat Baru & Update, read-only di mode Lihat. Saat Update tidak ada autofill ulang (menampilkan nilai tersimpan), dan perubahan tidak menulis balik ke data sosial. | US-003; BR-006, BR-007, BR-008, BR-009, BR-029, BR-030, BR-031 |
| **FR-004** | **Section Persetujuan Pelepasan Informasi** — pertanyaan Ya/Tidak (default Tidak); bila Ya menampilkan baris dinamis Nama + Hubungan (enum), bisa tambah/hapus. | US-004; BR-010, BR-011, BR-012, BR-013 |
| **FR-005** | **Section Privasi / Izin Dijenguk** — pertanyaan Ya/Tidak (default Tidak); bila Ya menampilkan baris dinamis nama pengecualian, bisa tambah/hapus, isian opsional. | US-005; BR-014, BR-015 |
| **FR-006** | **Simpan versi pertama & transisi state tombol** — validasi lalu simpan versi 1 (aktif), catat audit trail; tombol → Update, form read-only, Print aktif. | US-006; BR-016, BR-017, BR-018 |
| **FR-007** | **Update & versioning** — dari Lihat klik Update → editable (menampilkan nilai tersimpan, tanpa autofill ulang dari data sosial); Simpan membuat versi baru dan mengarsipkan versi lama; versi aktif selalu terbaru. | US-007; BR-019, BR-020, BR-021, BR-022, BR-030 |
| **FR-008** | **Cetak PDF general consent** — merakit PDF dari template teks pernyataan tenant + data consent versi aktif + area tanda tangan; PDF diunduh; Print aktif hanya bila ada versi aktif & tidak dalam mode edit. Format Syariah pada Phase 1. | US-008; BR-021, BR-023, BR-024, BR-025, BR-026 |
| **FR-009** | **Pencatatan audit trail** — setiap create/update menulis entri audit lengkap di DB, tidak ditampilkan ke user (Phase 1). | US-009; BR-027, BR-028 |
| **FR-010** | **Validasi field wajib saat Simpan** — bila field wajib kosong, tampilkan pesan "[Nama Field] wajib diisi" dan batalkan penyimpanan; baris opsional (Pelepasan Informasi & Privasi) tidak memblok Simpan meski kosong. | US-006; BR-008, BR-013, BR-015, BR-018 |

## 11. User Stories

| ID | User Story | Acceptance Criteria (Given-When-Then) | Trace |
|----|------------|----------------------------------------|-------|
| **US-001** | Sebagai **petugas pendaftaran**, saya ingin membuka form General Consent dari dashboard Pendaftaran RJ dan langsung diarahkan ke mode yang tepat (buat baru atau lihat/perbarui), sehingga saya tidak membuat consent ganda untuk pasien yang sudah punya. | 1) Given pasien tanpa consent, When form dibuka, Then form mode Buat Baru (BR-003). 2) Given pasien dengan consent, When form dibuka, Then mode Lihat (read-only) menampilkan versi aktif (BR-003). 3) Then tidak mungkin terbentuk dua consent aktif untuk satu pasien (BR-002). | FR-001; BR-001, BR-002, BR-003 |
| **US-002** | Sebagai **petugas**, saya ingin melihat identitas pasien di header form, sehingga saya yakin sedang mengisi consent untuk pasien yang benar. | 1) Then header menampilkan No. RM, Nama, Tgl Lahir + umur sesuai data sosial (BR-004). 2) Then header tidak dapat diedit (BR-004). | FR-002; BR-004, BR-005 |
| **US-003** | Sebagai **petugas**, saya ingin identitas penandatangan terisi otomatis dari data sosial dan tetap bisa saya sesuaikan, sehingga pengisian cepat tapi tetap akurat. | 1) Given mode Buat Baru, Then kelima isian terisi dari data sosial (Yang bertandatangan default Pasien) (BR-006, BR-007). 2) When mengganti ke Wali, Then isi field tidak dihapus/diubah (BR-007). 3) When Nama kosong saat Simpan, Then muncul validasi (BR-008). 4) Then field read-only di mode Lihat; editable di Buat Baru & Update (BR-009). 5) Then autofill dari data sosial hanya terjadi sekali saat Buat Baru (BR-029). 6) Given mode Update, When form editable, Then field menampilkan nilai tersimpan tanpa autofill ulang (BR-030). 7) When data consent diubah & disimpan, Then data sosial pasien tidak berubah (BR-031). | FR-003; BR-006, BR-007, BR-008, BR-009, BR-029, BR-030, BR-031 |
| **US-004** | Sebagai **petugas**, saya ingin mencatat siapa saja yang berhak menerima informasi pasien beserta hubungannya, sehingga pelepasan informasi sesuai persetujuan pasien. | 1) Then default Tidak; field tersembunyi (BR-010). 2) When memilih Ya, Then muncul baris Nama + Hubungan (BR-010). 3) Then petugas bisa menambah & menghapus baris (BR-012). 4) Then dropdown Hubungan terisi dari enum (BR-011). 5) Given Ya tapi baris tidak terisi, When Simpan, Then tidak ada validasi (opsional) (BR-013). | FR-004; BR-010, BR-011, BR-012, BR-013 |
| **US-005** | Sebagai **petugas**, saya ingin mencatat preferensi privasi pasien terkait pihak yang tidak diberi izin menjenguk, sehingga keinginan pasien terdokumentasi. | 1) Then default Tidak; field tersembunyi (BR-014). 2) When memilih Ya, Then muncul baris nama pengecualian (BR-014). 3) Then petugas bisa menambah & menghapus baris (BR-015). 4) Given Ya dengan baris kosong, When Simpan, Then tidak memblok Simpan (BR-015). | FR-005; BR-014, BR-015 |
| **US-006** | Sebagai **petugas**, saya ingin menyimpan general consent dengan cepat dan setelah itu bisa langsung mencetaknya, sehingga pasien bisa menandatangani dokumen. | 1) Then Print nonaktif sebelum simpan (BR-016). 2) When Simpan valid, Then tombol jadi Update, form read-only, Print aktif (BR-017). 3) Then versi 1 tercatat sebagai versi aktif (BR-017). 4) Then simpan < 1 detik (NFR-001). | FR-006, FR-010; BR-016, BR-017, BR-018 |
| **US-007** | Sebagai **petugas**, saya ingin memperbarui general consent pasien lama bila isinya berubah tanpa menghilangkan jejak versi sebelumnya, sehingga riwayat persetujuan tetap utuh. | 1) When klik Update, Then form editable, tombol jadi Simpan, Print nonaktif (BR-019). 2) When Simpan, Then versi baru dibuat & versi lama diarsip (tidak hilang) (BR-020). 3) Then setelah simpan → Update + read-only + Print aktif (BR-017). 4) Then versi aktif selalu yang terbaru (BR-021). 5) Given mode Update, Then form menampilkan nilai tersimpan tanpa autofill ulang dari data sosial (BR-030). | FR-007; BR-019, BR-020, BR-021, BR-022, BR-030 |
| **US-008** | Sebagai **petugas**, saya ingin mencetak general consent sebagai PDF dengan teks pernyataan sesuai rumah sakit kami, sehingga pasien menandatangani dokumen yang sah dan sesuai kebijakan RS. | 1) When Print, Then menghasilkan file PDF terunduh (BR-024). 2) Then PDF memuat data consent versi aktif + teks pernyataan template klien + area tanda tangan (BR-021, BR-025). 3) Then Print nonaktif sebelum simpan dan saat mode edit (BR-023). 4) Then generate PDF < 1 detik (NFR-002). | FR-008; BR-021, BR-023, BR-024, BR-025, BR-026 |
| **US-009** | Sebagai **admin/auditor**, saya ingin tahu siapa membuat/memperbarui general consent dan kapan, sehingga bisa ditelusuri bila ada sengketa. | 1) Then setiap create/update consent membuat entri audit (BR-027). 2) Then entri mencatat user, timestamp, before/after, versi (BR-028). 3) Then tidak ada UI audit di Phase 1 (BR-028). | FR-009; BR-027, BR-028 |

## 12. Data Requirements (Spesifikasi Field)

> Field demografi & identitas **reuse definisi kanonik dari PRD Pendaftaran RJ — Data Sosial** — nama, tipe, format, validasi **harus sama**. Autofill dari data sosial hanya menyalin nilai **sekali** saat pembuatan consent baru (BR-029); setelahnya field consent independen — perubahan pada consent tidak menulis balik ke data sosial (BR-031).

### A. Layar TAMPIL — Header Identitas Pasien (FR-002)
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|-------|-------------|-----------------|-------------|---------|
| No. RM | Pendaftaran pasien | Text | — | Read-only |
| Nama Pasien | Data Sosial — Nama Pasien | Text | — | Read-only |
| Tanggal Lahir + Umur | Data Sosial — Tanggal Lahir `[PERLU KONFIRMASI: sumber di dokumen tertulis "Nama Pasien", kemungkinan typo — seharusnya field Tanggal Lahir]` | Tanggal + umur | — | Read-only |

### B. Layar INPUT — Section Identitas Penandatangan (FR-003)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| yang_bertandatangan | Yang Bertandatangan | Radio button (Pasien / Wali) | Ya | — | Default: Pasien | Mengganti pilihan tidak meng-clear field lain (BR-007) |
| nama | Nama | Input text | Ya (Mandatory) | Min 3 char, Max 200 char | Autofill: Data Sosial — Nama Pasien | Editable (BR-008) |
| alamat | Alamat | Input text | Ya (Mandatory) | Min 3 char, Max 255 char | Autofill: Data Sosial — Alamat Pasien | Editable; mengikuti ketersediaan data sosial |
| no_telepon | No. Telepon | Numerik | Ya (Mandatory) | Min 3 char, Max 16 char; Format: minimal 11 angka, diawali "08" `[PERLU KONFIRMASI: "Min 3 char" bertentangan dengan "minimal 11 angka"]` | Autofill: Data Sosial — No. Telepon | Editable |
| no_identitas | No. Identitas / KTP / SIM | Input text | Ya (Mandatory) | Min 1 char, Max 20 char | Autofill: Data Sosial — Nomor Identitas | Editable |

> **Catatan autofill (BR-029, BR-030, BR-031):** kolom "Sumber/Default" di atas berlaku hanya pada mode **Buat Baru** (autofill sekali). Pada mode **Update**, field diisi dari nilai consent versi aktif yang tersimpan, **bukan** dari data sosial (tanpa autofill ulang). Perubahan nilai field consent **tidak** menulis balik ke data sosial pasien.

### C. Layar INPUT — Section Persetujuan Pelepasan Informasi (FR-004)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| pelepasan_info | Apakah ada orang lain yang berhak mendapat informasi pasien? | Radio button (Ya / Tidak) | Ya | — | Default: Tidak | Jika Ya → tampilkan baris di bawah |
| pelepasan_nama | Nama | Input text | Tidak (Opsional) | Min 3 char | Manual | Muncul bila = Ya |
| pelepasan_hubungan | Hubungan | Single select dropdown | Tidak (Opsional) | Enum: Ayah, Ibu, Anak, Saudara Kandung, Suami, Istri, Bibi, Paman, Kakek, Nenek, Cucu, Cicit, Tetangga, Rekan Kerja, Lain-lain | Manual | Muncul bila = Ya |
| pelepasan_baris | Baris Dinamis | Aksi | — | — | — | Tambah/hapus baris |

### D. Layar INPUT — Section Privasi / Izin Dijenguk (FR-005)
| Field | Label | Tipe | Wajib | Validasi/Format | Sumber/Default | Catatan |
|-------|-------|------|-------|-----------------|----------------|---------|
| privasi_izin | Apakah pasien/wali mengizinkan pasien untuk dijenguk oleh keluarga/kerabat? | Radio button (Ya / Tidak) | Ya | — | Default: Tidak | Jika Ya → tampilkan baris di bawah |
| privasi_nama | Nama orang yang tidak diberi izin menjenguk pasien | Input text | Tidak (Opsional) | Min 3 char, Max 200 char | Manual | Muncul bila = Ya; boleh dikosongkan |
| privasi_baris | Baris Dinamis | Aksi | — | — | — | Tambah/hapus baris |

### E. Data TER-GENERATE saat Simpan (FR-006, FR-007, FR-009)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| consent_id | ID Consent | ID | Dibuat otomatis oleh sistem | Unik per consent (BR-002) |
| nomor_versi | Nomor Versi | Integer | Dibuat otomatis; versi 1 saat create, bertambah tiap update | BR-017, BR-020 |
| status_versi | Status Versi | Enum (Aktif / Arsip) | Ditetapkan sistem | Satu versi Aktif per pasien (BR-002, BR-021) |
| timestamp_save | Timestamp Simpan | Datetime | Server time saat save | Audit (BR-028) |

### F. Audit Trail (DB-Only, Phase 1) (FR-009)
| Field | Label | Tipe | Format/Sumber | Catatan |
|-------|-------|------|---------------|---------|
| timestamp_save | Timestamp Simpan | Datetime | Server time saat save | — |
| user_id | User ID | Referensi | Referensi staf pencatat | — |
| user_name | User Name | Text (snapshot) | Referensi staf pencatat | — |
| action_type | Action Type | Enum | CREATE_CONSENT / UPDATE_CONSENT | — |
| patient_id, consent_id, nomor_versi | Referensi Entitas | Referensi | — | — |
| before_value | Before Value | JSON | Snapshot before (untuk UPDATE) | — |
| after_value | After Value | JSON | Snapshot after (untuk UPDATE) | — |
| ip_address | IP Address | Text | Sesuai BR-028 | `[PERLU KONFIRMASI: tercantum di aturan BR-028 namun tidak ada di daftar field Data Requirement sumber]` |
| user_agent | User Agent | Text | Sesuai BR-028 | `[PERLU KONFIRMASI: tercantum di aturan BR-028 namun tidak ada di daftar field Data Requirement sumber]` |

> `[PERLU KONFIRMASI]` Penomoran daftar Audit Trail di sumber melompat dari 5 ke 7 (tidak ada nomor 6) — konfirmasi apakah ada field yang terlewat.

### G. Validasi
| Fitur | Kondisi | Pesan / Perilaku |
|-------|---------|------------------|
| Nama (penandatangan) | Kosong saat Simpan | Menampilkan pesan "[Nama Field] wajib diisi" |
| Pelepasan Informasi = Ya | Tidak ada baris Nama + Hubungan terisi | Tidak ada error. Boleh kosong (tidak ada pengecualian) |
| Privasi = Ya | Baris nama kosong | Tidak ada error. Boleh kosong (tidak ada pengecualian) |

## 13. Non-Functional Requirements

| ID | Kategori | Requirement | Sumber |
|----|----------|-------------|--------|
| **NFR-001** | Performa | Simpan general consent selesai < 1 detik. | Metrik 2; BR-017 |
| **NFR-002** | Performa | Generate PDF general consent < 1 detik. | Metrik 3; BR-024 |
| **NFR-003** | Auditabilitas / Integritas Riwayat | 100% pembaruan menghasilkan versi baru tanpa kehilangan versi lama; setiap create/update tercatat di audit trail. | Metrik 4; BR-020, BR-027 |
| **NFR-004** | Reliabilitas / Integritas Data | Konsistensi satu versi aktif per pasien pada satu waktu. | BR-002 |
| **NFR-005** | Konfigurabilitas | Teks pernyataan output cetak dapat diatur per tenant/rumah sakit. | BR-025 |
| **NFR-006** | Keamanan / Auditabilitas | Audit trail tidak ditampilkan ke user (investigasi via DB pada Phase 1); mencatat ip_address & user_agent. | BR-028 |

## 14. Integrasi Eksternal & Dependency

| Integrasi | Fungsi di modul ini | Status | Trace |
|-----------|---------------------|--------|-------|
| **Data Sosial Pasien (Pendaftaran RJ)** | Sumber autofill identitas penandatangan & header pasien. | Internal | FR-002, FR-003 |
| **Template teks pernyataan per tenant (config klien)** | Sumber teks pernyataan pada output cetak (Format Syariah pada Phase 1). | Internal / Config | FR-008; BR-025, BR-026 |
| **SATUSEHAT Consent** | — (di luar lingkup Fase 1). | Out Scope `[**]` | Out Scope |

| Dependency | Tipe | Dampak Jika Belum Siap |
|------------|------|------------------------|
| PRD Pendaftaran RJ — Data Sosial | Hard | Tanpa data sosial, autofill & header identitas tidak berfungsi. |
| Print Out General Consent — Format Syariah (template cetak) | Hard | Cetak PDF Phase 1 tidak dapat dirakit tanpa template pernyataan tenant. |
| Desain Figma | Soft | Acuan tampilan; keterlambatan menunda finalisasi UI. |

## 15. Roadmap
| Fase | Cakupan |
|------|---------|
| **Fase 1 (MVP)** | General Consent RJ: deteksi mode, autofill, dua persetujuan kondisional, Simpan/Update dengan versioning & arsip, cetak PDF Format Syariah, audit trail DB. |
| **Fase 2** `[**]` | Format General untuk cetak; integrasi SATUSEHAT Consent; General Consent RI/IGD; tanda tangan digital / e-signature. |

## 16. Asumsi
- `[ASUMSI]` PIC modul = Elfira (System Analyst), berdasarkan metadata sumber.
- `[ASUMSI]` Dokumen ID PRD-P-GC-RJ-v2.0 mengikuti pola penomoran PRD Neurovi v2 — belum ada ID resmi di sumber.
- `[ASUMSI]` Baris opsional "minimal 1 baris muncul saat memilih Ya" (BR-012) berarti baris tampil sebagai kolom kosong, bukan isian wajib — sejalan dengan aturan validasi opsional (BR-013).

## 17. Pertanyaan Terbuka
- `[PERLU KONFIRMASI]` **Prioritas (P0–P4) per fitur belum diisi** di tabel breakdown User Story sumber (kolom "P" kosong) — mohon penetapan level prioritas per fitur.
- `[PERLU KONFIRMASI]` **Konflik validasi No. Telepon**: Data Requirement menyebut "Min 3 char" sekaligus "Format: minimal 11 angka, diawali 08". Mana yang mengikat?
- `[PERLU KONFIRMASI]` **Sumber field "Tanggal Lahir + Umur"** di Data Requirement tertulis "Nama Pasien" — kemungkinan typo; konfirmasi sumbernya field Tanggal Lahir data sosial.
- `[PERLU KONFIRMASI]` **Referensi "sesuai K9"** pada aturan baris dinamis Privasi (Fitur 5) — rujukan K9 tidak terdefinisi di dokumen; konfirmasi maksudnya.
- `[PERLU KONFIRMASI]` **Penomoran Audit Trail** melompat dari 5 ke 7 (tidak ada 6) — apakah ada field yang terlewat?
- `[PERLU KONFIRMASI]` **Field ip_address & user_agent** disebut di aturan (BR-028) tapi tidak muncul di daftar field Data Requirement — konfirmasi apakah keduanya termasuk skema audit.
- `[PERLU KONFIRMASI]` **Field Nama pada Pelepasan Informasi** bertanda Opsional namun bervalidasi "Min 3 char" — apakah min berlaku hanya bila field diisi?
- `[PERLU KONFIRMASI]` **Metadata Reviewer Teknis dan Target Release (kuartal)** belum tercantum di sumber.
- `[PERLU KONFIRMASI]` Section **Case**, **Change Log**, dan **Informasi Lain** kosong di sumber — konfirmasi apakah memang belum diisi.

## 18. Change Log
| Versi | Tanggal | Penyusun | Perubahan |
|-------|---------|----------|-----------|
| 1.0 | 30 Juni 2026 | Team Product | Draft awal General Consent. |
| 1.0-gen | 1 Juli 2026 | Team Product | Konversi ke format generator Neurovi v2 (penyusunan BR/US/FR/NFR + State Machine); konten sumber dipertahankan, inkonsistensi ditandai `[PERLU KONFIRMASI]`. |
| 1.0-gen.1 | 1 Juli 2026 | Team Product | Tambah aturan perilaku autofill: BR-029 (autofill sekali saat Buat Baru), BR-030 (tidak autofill ulang saat Update), BR-031 (perubahan consent tidak menulis balik ke data sosial). Dipropagasi ke FR-003, FR-007, US-003, US-007, Data Requirements, Main Flow, dan State Machine. |
