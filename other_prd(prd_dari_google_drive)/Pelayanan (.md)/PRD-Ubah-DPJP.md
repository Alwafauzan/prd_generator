# PRD — Ubah DPJP Rawat Inap

**Related Document:** `Bispro Ubah DPJP (1).pdf`; `Skenario DPJP.txt`; `TEMPLATE-PRD-Generator-Neurovi-v2.md`; PRD `Resume Medis` `[PERLU KONFIRMASI]`; PRD/fitur `SPRI`; PRD/fitur `TPPRI Rawat Inap`; PRD `Informasi Dokter yang Merawat & Riwayat Ubah DPJP pada EMR` `[TIKET/PRD TERPISAH]`  
**Dokumen ID:** PRD-P-UBAH-DPJP-RI-v2.6 · **Versi:** 7.0 (Draft — Revisi Sinkronisasi, EMR & Data Requirement)  
**Tanggal Disusun:** 22 Juli 2026 · **Penyusun:** Team Product — Tamtech International  
**Approver:** M. Sulthan Farras Nanz (Chief Strategy & Growth Officer) · **Reviewer Teknis:** `[PERLU KONFIRMASI]`  
**Status:** Untuk Direview · **Target Release:** `[PERLU KONFIRMASI]`

## 1. Overview / Brief Summary

Fitur **Ubah DPJP (Dokter Penanggung Jawab Pelayanan)** digunakan khusus pada **Pelayanan Rawat Inap** untuk mengelola seluruh dokter yang terlibat dalam satu episode perawatan pasien. Fitur mendukung penambahan dokter, perubahan peran, pergantian DPJP Utama, pembatalan kesalahan input, riwayat perubahan, pembentukan data awal dari SPRI sebelum episode Rawat Inap aktif, integrasi ke Resume Medis, dan Audit Trail.

Jenis peran dokter terdiri dari **DPJP Utama**, **Rawat Bersama**, **Rawat Bersama Ganti Lead**, dan **Alih Rawat**. Dalam satu waktu hanya boleh ada satu DPJP Utama aktif. Dokter berperan **Rawat Bersama Ganti Lead** hanya bila sebelumnya pernah menjadi DPJP Utama aktif pada episode yang sama.

Pada revisi ini, **tidak terdapat aksi Akhiri Peran**. Status keterlibatan dokter ditentukan otomatis berdasarkan peran yang dipilih:

- Peran **Alih Rawat** menghasilkan status **Tidak Aktif**.
- Peran **DPJP Utama**, **Rawat Bersama**, atau **Rawat Bersama Ganti Lead** menghasilkan status **Aktif**.

Kesalahan input dapat dikoreksi menggunakan aksi **Batalkan Input** dengan alasan wajib. Pembatalan tetap dapat dilakukan meskipun dokter sudah pernah melakukan input pelayanan. Setelah dibatalkan, record berstatus **Tidak Aktif** dan ditandai **Sudah Pernah Dihapus**. Record tersebut tidak ditampilkan pada daftar utama form Ubah DPJP dan tidak masuk Resume Medis, tetapi tetap ditampilkan pada tab **Riwayat** dan Audit Trail.

Pada proses **Tambah DPJP**, field **Peran** memiliki nilai default **Rawat Bersama**, tetapi user tetap dapat menggantinya melalui dropdown single select. Dokter berperan **Alih Rawat/Tidak Aktif** tidak dapat langsung diubah menjadi **DPJP Utama** melalui Edit Peran; pengaktifan kembali sebagai DPJP Utama harus dilakukan melalui proses **Tambah DPJP**, sehingga sistem membentuk record keterlibatan baru tanpa mengubah historical record sebelumnya.

Dokumentasi pelayanan yang telah dibuat dokter tetap tersimpan setelah Batalkan Input dan tetap mempertahankan dokter pembuatnya. Khusus pada **CPPT**, selama status verifikasi DPJP masih **Belum Diverifikasi**, dokter pada bagian verifikasi DPJP otomatis mengikuti **DPJP Utama aktif** terbaru. Isi CPPT, dokter pembuat CPPT, dan waktu pencatatan tidak berubah; yang diperbarui hanya penugasan DPJP untuk verifikasi. Verifikasi yang sudah selesai tidak diubah otomatis.

## 2. Background

**Kondisi saat ini (As-Is, Neurovi v1):**
- Fitur Ubah DPJP hanya tersedia pada Pelayanan Rawat Inap.
- Data awal dokter berasal dari SPRI yang dibuat pada pelayanan asal dan digunakan untuk membentuk data awal Ubah DPJP sebelum episode Rawat Inap aktif. Setelah episode Rawat Inap aktif, perubahan SPRI dan perubahan Ubah DPJP berjalan independen dan tidak saling menyinkronkan.
- Existing belum memiliki model peran, status, riwayat perubahan, dan aturan pembatalan input selengkap kebutuhan v2.
- Resume Medis baru menampilkan nama dokter tanpa pembagian dokter aktif, riwayat dokter tidak aktif, dan pengecualian record salah input secara eksplisit.

**Pain point:**
- Perubahan DPJP Utama berisiko menghilangkan konteks keterlibatan DPJP lama.
- Status keterlibatan dokter belum ditentukan secara konsisten berdasarkan perannya.
- Kesalahan input dokter perlu dapat dibatalkan tanpa menghapus Audit Trail, termasuk ketika dokter sudah pernah melakukan input pelayanan.
- User membutuhkan satu layar untuk mengetahui DPJP Utama, dokter kolaborator aktif, dokter Alih Rawat/tidak aktif, dan histori pembatalan input.

**Dampak utama v2:**
- Seluruh perubahan peran terdokumentasi sebagai historical record.
- Sistem selalu mengetahui satu DPJP Utama aktif.
- Status Aktif/Tidak Aktif konsisten dan dibuat otomatis berdasarkan peran.
- Resume Medis memisahkan dokter aktif dan riwayat dokter tidak aktif, serta mengecualikan record Sudah Pernah Dihapus.
- Kesalahan input dapat dikoreksi tanpa menghapus Audit Trail atau tab Riwayat.

## 3. In Scope

### Scope Definition (Fase 1 — MVP)
1. Ubah DPJP hanya pada Pelayanan Rawat Inap.
2. Pembentukan data awal Ubah DPJP dari SPRI hanya ketika episode Rawat Inap belum aktif; setelah episode Rawat Inap aktif, perubahan Ubah DPJP tidak memperbarui SPRI dan perubahan SPRI tidak memperbarui Ubah DPJP.
3. Tambah dokter dengan field **Peran** berupa dropdown single select dan default **Rawat Bersama**.
4. User dapat mengubah nilai default Peran melalui dropdown menjadi DPJP Utama, Rawat Bersama Ganti Lead, atau Alih Rawat sesuai validasi.
5. Edit peran dokter.
6. Pergantian DPJP Utama dengan konfirmasi.
7. Transisi otomatis DPJP Utama lama menjadi Rawat Bersama Ganti Lead Aktif.
8. Penentuan status otomatis berdasarkan peran:
   - Alih Rawat → Tidak Aktif;
   - selain Alih Rawat → Aktif.
9. Batalkan Input dengan alasan wajib.
10. Pembatalan input tetap tersedia meskipun dokter pernah melakukan input pelayanan.
11. Daftar dokter valid Aktif dan Tidak Aktif pada form Ubah DPJP.
12. Tab Riwayat yang tetap menampilkan record Sudah Pernah Dihapus.
13. Integrasi Resume Medis:
    - dokter Aktif valid → bagian **Dokter yang Merawat**;
    - dokter Tidak Aktif valid → bagian **Riwayat Dokter yang Merawat**;
    - dokter Tidak Aktif + Sudah Pernah Dihapus → tidak ditampilkan.
14. Audit Trail seluruh aktivitas tambah, ubah peran, ganti utama, dan batalkan input pada Ubah DPJP.
15. Dokter Alih Rawat/Tidak Aktif yang akan ditetapkan kembali sebagai DPJP Utama harus diproses melalui **Tambah DPJP**, bukan Edit Peran.
16. Sinkronisasi penugasan verifikasi DPJP pada CPPT yang masih Belum Diverifikasi ke DPJP Utama aktif terbaru, tanpa mengubah isi dan dokter pembuat CPPT.

### Out Scope
- Aksi **Akhiri Peran**.
- Billing.
- Penambahan informasi **Dokter yang Merawat** pada tab Kunjungan EMR dan tab **Riwayat Ubah DPJP** pada EMR — tiket/PRD terpisah.
- Master Dokter dan Master Spesialis.
- Bridging BPJS perubahan DPJP.
- Penjadwalan dokter.

## 4. Goals and Metrics

### Tujuan
Menyediakan pengelolaan DPJP yang konsisten, dapat ditelusuri, aman untuk rekam medis, dan menghasilkan data dokter yang akurat untuk Resume Medis.

### Metrik
| Metrik | Target | Trace |
|---|---|---|
| Episode dengan lebih dari satu DPJP Utama aktif | 0 | BR-006; FR-006 |
| Perubahan peran yang otomatis menghasilkan status sesuai aturan | 100% | BR-008; BR-009; FR-008 |
| Record Alih Rawat yang berstatus Aktif | 0 | BR-008; FR-008 |
| Record selain Alih Rawat yang berstatus Tidak Aktif tanpa status Sudah Pernah Dihapus | 0 | BR-009; FR-008 |
| Batal Input yang tetap tercatat pada tab Riwayat dan Audit Trail | 100% | BR-016; FR-011; FR-013 |
| Record Sudah Pernah Dihapus yang muncul pada daftar utama atau Resume Medis | 0 | BR-017; FR-010; FR-012 |
| Rawat Bersama Ganti Lead pada dokter yang belum pernah menjadi DPJP Utama aktif | 0 | BR-010; FR-005 |

## 5. Related Feature & Stakeholder

### A. Modul Terkait
| Modul | Peran |
|---|---|
| SPRI | Sumber pembentukan data awal Ubah DPJP sebelum episode Rawat Inap aktif; tidak lagi menjadi target/source sinkronisasi setelah episode aktif. |
| TPPRI Rawat Inap | Mengaktifkan episode Rawat Inap. |
| Pelayanan Rawat Inap | Entry point dan konteks fitur. |
| Master Dokter/Staf | Sumber lookup dokter. |
| Resume Medis | Konsumen dokter aktif dan riwayat dokter tidak aktif yang valid. |
| Tab Riwayat Ubah DPJP | Menampilkan seluruh perubahan, termasuk record Sudah Pernah Dihapus. |
| Audit Trail | Menyimpan seluruh jejak perubahan termasuk Batalkan Input. |
| CPPT | Mempertahankan isi dan dokter pembuat; memperbarui penugasan verifikasi DPJP yang masih Belum Diverifikasi mengikuti DPJP Utama aktif. |
| EMR — Tab Kunjungan & Riwayat Ubah DPJP | Akan menampilkan informasi dokter yang merawat yang masih aktif pada episode di tab Kunjungan serta menyediakan tab **Riwayat Ubah DPJP** untuk dokter aktif dan tidak aktif. Implementasi berada pada tiket dan PRD terpisah. |

### B. Persona
| Persona | Tipe | Peran |
|---|---|---|
| Petugas Pelayanan Rawat Inap | Primary | Menambah dokter, mengedit peran, mengganti DPJP Utama, membatalkan input, dan melihat riwayat. |
| Petugas Pelayanan Asal RJ/IGD | Secondary | Membuat/mengubah SPRI. |
| Petugas Rekam Medis | Secondary | Menggunakan data dokter pada Resume Medis. |
| Auditor/Administrator | Tersier | Menelusuri Audit Trail. |

## 6. Business Process (As-Is / To-Be)

### A. As-Is
1. User membuat SPRI pada pelayanan asal.
2. Selama episode Rawat Inap belum aktif, data dokter, jenis kasus, dan ruang perawatan dari SPRI digunakan untuk membentuk data awal Ubah DPJP.
3. Pasien didaftarkan melalui TPPRI dan episode Rawat Inap menjadi aktif.
4. Setelah episode Rawat Inap aktif, perubahan SPRI dari pelayanan asal tidak memperbarui Ubah DPJP dan perubahan Ubah DPJP tidak memperbarui SPRI.
5. Existing belum membedakan seluruh peran dan status secara eksplisit.

### B. To-Be
1. Sebelum episode Rawat Inap aktif, sistem membentuk data awal Ubah DPJP berdasarkan data dokter pada SPRI.
2. Setelah episode Rawat Inap aktif, Ubah DPJP menjadi sumber pengelolaan dokter pada episode Rawat Inap dan tidak lagi melakukan sinkronisasi dua arah dengan SPRI. Perubahan pada Ubah DPJP tidak mengubah SPRI, dan perubahan SPRI dari pelayanan asal tidak mengubah Ubah DPJP.
3. Sistem menampilkan daftar dokter valid, termasuk dokter Aktif dan Tidak Aktif.
4. DPJP Utama aktif ditandai ikon mahkota dan hanya boleh satu.
5. User menambah dokter dengan memilih dokter; field Peran otomatis terisi **Rawat Bersama** dan dapat diubah melalui dropdown single select.
6. User dapat mengedit peran melalui ikon Edit, kecuali perubahan dokter Alih Rawat/Tidak Aktif menjadi DPJP Utama harus dilakukan melalui **Tambah DPJP**.
7. Sistem menentukan status otomatis setiap kali peran dipilih atau diubah:
   - jika peran = Alih Rawat, status = Tidak Aktif;
   - jika peran ≠ Alih Rawat, status = Aktif.
8. Bila dokter diubah menjadi DPJP Utama:
   - sistem meminta konfirmasi;
   - dokter tersebut menjadi DPJP Utama Aktif;
   - DPJP Utama lama otomatis menjadi Rawat Bersama Ganti Lead Aktif.
9. User tetap dapat menambah dokter baru sebagai Rawat Bersama walaupun daftar sudah memiliki dokter dengan peran Alih Rawat atau status Tidak Aktif.
10. User dapat Batalkan Input dengan alasan wajib, termasuk bila dokter sudah pernah melakukan input pelayanan.
11. Setelah Batalkan Input:
   - status keterlibatan menjadi Tidak Aktif;
   - record ditandai Sudah Pernah Dihapus;
   - record tidak tampil pada daftar utama Ubah DPJP;
   - record tetap tampil pada tab Riwayat dan Audit Trail;
   - record tidak tampil pada Resume Medis.
12. Pembatalan keterlibatan DPJP tidak menghapus atau mengubah dokumentasi pelayanan yang sudah dibuat dokter; dokumentasi tetap mempertahankan dokter pembuatnya.
13. Untuk CPPT yang verifikasi DPJP-nya masih Belum Diverifikasi, sistem memperbarui dokter verifikator mengikuti DPJP Utama aktif terbaru. Isi CPPT dan dokter pembuat tidak berubah. CPPT yang sudah diverifikasi tidak diperbarui otomatis.
### C. Skenario Referensi
| Tahap | Daftar Dokter Setelah Proses |
|---|---|
| Kondisi awal | dr. Adi — DPJP Utama, Aktif; dr. Mia — Rawat Bersama, Aktif; dr. Muna — Alih Rawat, Tidak Aktif. |
| Tambah dr. Bekti | dr. Bekti ditambahkan sebagai Rawat Bersama, Aktif. |
| Jadikan dr. Mia utama | dr. Mia menjadi DPJP Utama Aktif; dr. Adi otomatis menjadi Rawat Bersama Ganti Lead Aktif. |
| Ubah dr. Adi menjadi Alih Rawat | dr. Adi menjadi Alih Rawat dan status otomatis menjadi Tidak Aktif. |
| Batalkan input dr. Bekti | dr. Bekti menjadi Tidak Aktif + Sudah Pernah Dihapus; tidak tampil pada daftar utama/Resume Medis, tetapi tetap tampil pada tab Riwayat dan Audit Trail. |

## 7. Main Flow / Mindmap

### Skenario 1 — Tambah dr. Bekti sebagai Rawat Bersama
1. User klik **+ Dokter**.
2. User memilih dr. Bekti.
3. Field Peran otomatis terisi **Rawat Bersama** sebagai default.
4. User dapat mempertahankan default tersebut atau memilih peran lain melalui dropdown single select.
5. Sistem otomatis menetapkan status = Aktif karena peran bukan Alih Rawat.
6. Sistem menyimpan dr. Bekti sebagai Rawat Bersama Aktif.
7. Sistem mencatat Audit Trail. Karena episode Rawat Inap sudah aktif, perubahan ini tidak disinkronkan ke SPRI.

### Skenario 2 — Ubah dr. Mia menjadi DPJP Utama
1. User klik ikon Edit pada dr. Mia.
2. User memilih Peran = DPJP Utama.
3. Sistem menampilkan konfirmasi: **“Apakah Anda yakin ingin mengubah dr. Mia sebagai DPJP Utama?”**
4. Setelah user memilih **Yakin**:
   - dr. Mia menjadi DPJP Utama Aktif;
   - dr. Adi sebagai DPJP Utama lama otomatis menjadi Rawat Bersama Ganti Lead Aktif;
   - sistem mencatat dua perubahan dalam satu transaksi atomik.

### Skenario 3 — Ubah dr. Adi menjadi Alih Rawat
1. User klik ikon Edit pada dr. Adi.
2. User memilih Peran = Alih Rawat.
3. Sistem menampilkan konfirmasi: **“Apakah Anda yakin mengubah status dr. Adi menjadi Alih Rawat? dr. Adi tidak akan memiliki kewenangan terhadap pasien [Nama Pasien] ini lagi.”**
4. Setelah user memilih **Yakin**:
   - Peran dr. Adi menjadi Alih Rawat;
   - Status dr. Adi otomatis menjadi Tidak Aktif;
   - record tetap tampil pada daftar Ubah DPJP sebagai histori valid.

### Skenario 4 — Mengaktifkan Kembali Dokter Alih Rawat
1. Dokter dengan peran Alih Rawat memiliki status Tidak Aktif dan historical record tetap ditampilkan.
2. Bila dokter akan diaktifkan kembali sebagai **Rawat Bersama**, user dapat mengubah peran melalui Edit Peran; status otomatis menjadi Aktif.
3. Bila dokter akan ditetapkan kembali sebagai **DPJP Utama**, user tidak dapat memilih DPJP Utama melalui Edit Peran.
4. User harus memilih **+ Dokter**, memilih dokter yang sama, lalu mengubah default Peran Rawat Bersama menjadi **DPJP Utama**.
5. Sistem membuat record keterlibatan baru sebagai DPJP Utama Aktif dan mempertahankan record Alih Rawat lama sebagai histori Tidak Aktif.
6. Untuk Rawat Bersama Ganti Lead, sistem tetap memvalidasi riwayat dokter sebagai DPJP Utama aktif pada episode yang sama.

### Skenario 5 — Tambah Dokter ketika Terdapat Dokter Alih Rawat/Tidak Aktif
1. Daftar dokter telah memiliki satu atau lebih record Alih Rawat/Tidak Aktif.
2. Tombol **+ Dokter** tetap tersedia selama episode Rawat Inap aktif.
3. User memilih dokter baru dan Peran = Rawat Bersama.
4. Sistem menyimpan dokter baru sebagai Rawat Bersama Aktif.
5. Keberadaan dokter Alih Rawat/Tidak Aktif tidak memblok proses penambahan dokter baru.

### Skenario 6 — Batalkan Input dr. Bekti
1. User klik ikon Batalkan Input pada dr. Bekti.
2. Sistem menampilkan field **Alasan Batalkan Input**.
3. User mengisi alasan pembatalan.
4. Sistem menampilkan informasi bahwa proses tidak dapat dibatalkan.
5. Setelah user klik **Lanjut**, sistem menampilkan konfirmasi final.
6. Setelah user mengonfirmasi:
   - status keterlibatan menjadi Tidak Aktif;
   - record_status menjadi Sudah Pernah Dihapus;
   - dr. Bekti tidak tampil pada daftar utama form Ubah DPJP;
   - dr. Bekti tetap tampil pada tab Riwayat dengan status Tidak Aktif dan penanda Sudah Pernah Dihapus;
   - dr. Bekti tidak tampil pada Resume Medis;
   - Audit Trail tetap menyimpan aktor, waktu, alasan, dan data sebelum pembatalan.
7. Proses tetap dapat dilakukan meskipun dr. Bekti sudah pernah melakukan input pelayanan.

### Skenario 7 — Dampak Batalkan Input dan Pergantian DPJP terhadap CPPT
1. Dokter telah membuat input CPPT; isi CPPT, dokter pembuat, dan waktu pencatatan tersimpan sebagai dokumentasi pelayanan.
2. User melakukan Batalkan Input terhadap keterlibatan dokter atau mengganti DPJP Utama aktif.
3. Sistem tidak menghapus atau mengubah isi CPPT dan tidak mengganti dokter pembuat CPPT.
4. Jika status verifikasi DPJP pada CPPT masih **Belum Diverifikasi**, sistem memperbarui dokter pada bagian verifikasi DPJP mengikuti DPJP Utama aktif terbaru.
5. Jika CPPT sudah diverifikasi, data verifikasi tidak diperbarui otomatis.
6. Sistem mencatat perubahan penugasan verifikator DPJP pada Audit Trail sesuai kebutuhan modul CPPT.

### Skenario 8 — Penyusunan Resume Medis
1. Sistem mengambil record valid berstatus Aktif untuk bagian **Dokter yang Merawat**.
2. Sistem mengambil record valid berstatus Tidak Aktif untuk bagian **Riwayat Dokter yang Merawat**.
3. Sistem mengecualikan record Tidak Aktif yang memiliki penanda **Sudah Pernah Dihapus** dari seluruh bagian Resume Medis.

## 8. Business Rules

| ID | Rule | Trace |
|---|---|---|
| **BR-001** | Fitur hanya tersedia pada Pelayanan Rawat Inap. | FR-001 |
| **BR-002** | Perubahan hanya diizinkan saat episode Rawat Inap aktif. | FR-002 |
| **BR-003** | Data awal Ubah DPJP dibentuk dari SPRI hanya sebelum episode Rawat Inap aktif. Setelah episode aktif, perubahan pada Ubah DPJP tidak memperbarui SPRI dan perubahan SPRI tidak memperbarui Ubah DPJP. | FR-003 |
| **BR-004** | Saat menambah dokter, field Peran wajib berupa dropdown single select dengan default **Rawat Bersama**; user dapat mengubahnya sesuai validasi. | FR-004 |
| **BR-005** | Pilihan Peran: DPJP Utama, Rawat Bersama, Rawat Bersama Ganti Lead, dan Alih Rawat. | FR-004 |
| **BR-006** | Hanya boleh ada satu DPJP Utama Aktif pada satu waktu. | FR-006 |
| **BR-007** | Tidak tersedia aksi Akhiri Peran. | Scope; FR-008 |
| **BR-008** | Jika peran dokter adalah Alih Rawat, sistem otomatis menetapkan status Tidak Aktif. | FR-008 |
| **BR-009** | Jika peran dokter selain Alih Rawat, sistem otomatis menetapkan status Aktif. | FR-008 |
| **BR-010** | Rawat Bersama Ganti Lead hanya dapat diberikan kepada dokter yang pernah menjadi DPJP Utama Aktif pada episode yang sama. | FR-005 |
| **BR-011** | Saat DPJP Utama baru ditetapkan, DPJP Utama lama otomatis menjadi Rawat Bersama Ganti Lead Aktif. | FR-007 |
| **BR-012** | Pergantian DPJP Utama dan perubahan DPJP lama harus dilakukan atomik. | NFR-005 |
| **BR-013** | Dokter valid berstatus Tidak Aktif tetap tampil pada daftar Ubah DPJP. | FR-010 |
| **BR-014** | Keberadaan dokter Alih Rawat/Tidak Aktif tidak memblok user untuk menambah dokter baru sebagai Rawat Bersama. | FR-009 |
| **BR-015** | Batalkan Input wajib memiliki alasan dan dapat dilakukan walaupun dokter sudah pernah melakukan input pelayanan. | FR-011 |
| **BR-016** | Setelah Batalkan Input, status dokter menjadi Tidak Aktif dan record ditandai Sudah Pernah Dihapus. | FR-011 |
| **BR-017** | Record Sudah Pernah Dihapus tidak tampil pada daftar utama Ubah DPJP, tetapi tetap tampil pada tab Riwayat dan Audit Trail. | FR-010; FR-013 |
| **BR-018** | Record Sudah Pernah Dihapus tidak tampil pada Resume Medis. | FR-012 |
| **BR-019** | Resume Medis menampilkan dokter valid Aktif pada bagian Dokter yang Merawat. | FR-012 |
| **BR-020** | Resume Medis menampilkan dokter valid Tidak Aktif pada bagian Riwayat Dokter yang Merawat. | FR-012 |
| **BR-021** | Seluruh perubahan, termasuk Batalkan Input, dicatat pada Audit Trail. | FR-013 |
| **BR-022** | Dokumentasi pelayanan yang dibuat dokter sebelum Batalkan Input tetap tersimpan dan tetap mempertahankan dokter pembuatnya. | FR-014 |
| **BR-023** | Untuk CPPT berstatus verifikasi DPJP **Belum Diverifikasi**, dokter verifikator DPJP otomatis mengikuti DPJP Utama aktif terbaru; isi CPPT dan dokter pembuat tidak berubah. | FR-014 |
| **BR-024** | CPPT yang sudah diverifikasi tidak mengalami perubahan otomatis pada dokter verifikator DPJP. | FR-014 |
| **BR-025** | Dokter Alih Rawat/Tidak Aktif tidak dapat diubah langsung menjadi DPJP Utama melalui Edit Peran; harus melalui Tambah DPJP dan dibuat sebagai record keterlibatan baru. | FR-015 |

## 9. State Machine

### 9.1 Dua Dimensi Status

Sistem menggunakan dua dimensi agar status keterlibatan tidak bercampur dengan status koreksi data:

| Dimensi | Nilai | Makna |
|---|---|---|
| **involvement_status** | Aktif | Peran dokter selain Alih Rawat dan record belum dibatalkan. |
| **involvement_status** | Tidak Aktif | Peran dokter adalah Alih Rawat atau record telah dibatalkan. |
| **record_status** | Valid | Record merupakan bagian sah dari daftar dan riwayat pasien. |
| **record_status** | Sudah Pernah Dihapus | Record salah input; disembunyikan dari daftar utama dan Resume Medis, tetapi tetap ada pada tab Riwayat dan Audit Trail. |

### 9.2 Matriks Tampilan
| involvement_status | record_status | Daftar Utama Ubah DPJP | Tab Riwayat | Resume Medis | Audit Trail |
|---|---|---|---|---|---|
| Aktif | Valid | Tampil | Tampil | Dokter yang Merawat | Tampil |
| Tidak Aktif | Valid | Tampil | Tampil | Riwayat Dokter yang Merawat | Tampil |
| Tidak Aktif | Sudah Pernah Dihapus | Tidak tampil | Tampil | Tidak tampil | Tampil |

### 9.3 Transisi Peran dan Status
- DPJP Utama Aktif → Rawat Bersama Ganti Lead Aktif ketika DPJP Utama baru ditetapkan.
- Rawat Bersama Ganti Lead Aktif → Alih Rawat Tidak Aktif melalui Edit Peran.
- Rawat Bersama Aktif → Alih Rawat Tidak Aktif melalui Edit Peran.
- Alih Rawat Tidak Aktif → Rawat Bersama Aktif melalui Edit Peran.
- Alih Rawat Tidak Aktif → DPJP Utama Aktif hanya melalui Tambah DPJP sebagai record baru; historical record Alih Rawat lama tetap dipertahankan.
- Record Valid → Sudah Pernah Dihapus melalui Batalkan Input; involvement_status menjadi Tidak Aktif.

## 10. Aksi Terstruktur

| Aksi | Perilaku | Kondisi |
|---|---|---|
| **+ Dokter** | Membuka form tambah dokter; Peran default Rawat Bersama dan dapat diubah melalui dropdown single select. | Episode aktif; tetap tersedia walaupun terdapat dokter Alih Rawat/Tidak Aktif; wajib digunakan bila dokter Tidak Aktif akan ditetapkan kembali sebagai DPJP Utama. |
| **Edit Peran** | Mengubah peran dan otomatis menghitung ulang status berdasarkan peran. Dokter Alih Rawat/Tidak Aktif tidak dapat diubah menjadi DPJP Utama melalui aksi ini. | Record Valid; pembatasan perubahan ke DPJP Utama mengikuti BR-025. |
| **Batalkan Input** | Meminta alasan, menampilkan konfirmasi irreversible, mengubah status menjadi Tidak Aktif, dan menandai record Sudah Pernah Dihapus. | Record Valid. |

## 11. Functional Requirements

| ID | Functional Requirement | Trace |
|---|---|---|
| **FR-001** | Menyediakan entry point Ubah DPJP dari daftar pasien Rawat Inap. | BR-001 |
| **FR-002** | Mengaktifkan perubahan hanya pada episode Rawat Inap aktif. | BR-002 |
| **FR-003** | Membentuk data awal Ubah DPJP dari SPRI sebelum episode Rawat Inap aktif. Setelah episode aktif, sistem memisahkan perubahan Ubah DPJP dari SPRI dan tidak menjalankan sinkronisasi dua arah. | BR-003 |
| **FR-004** | Menyediakan form Tambah DPJP dengan field Dokter dan Peran dropdown single select; Peran default Rawat Bersama dan dapat diubah user sesuai validasi. | BR-004; BR-005 |
| **FR-005** | Menonaktifkan/menolak Rawat Bersama Ganti Lead bila dokter belum pernah menjadi DPJP Utama aktif pada episode yang sama. | BR-010 |
| **FR-006** | Menjaga tepat satu DPJP Utama aktif. | BR-006 |
| **FR-007** | Saat user menjadikan dokter baru sebagai DPJP Utama, sistem mengubah DPJP Utama lama menjadi Rawat Bersama Ganti Lead Aktif secara atomik. | BR-011; BR-012 |
| **FR-008** | Menghitung status otomatis berdasarkan peran: Alih Rawat = Tidak Aktif; selain Alih Rawat = Aktif. | BR-007; BR-008; BR-009 |
| **FR-009** | Memastikan tombol + Dokter tetap tersedia walaupun terdapat record Alih Rawat/Tidak Aktif dan mengizinkan penambahan dokter baru sebagai Rawat Bersama. | BR-014 |
| **FR-010** | Menampilkan record Valid Aktif dan Tidak Aktif pada daftar utama, serta menyembunyikan record Sudah Pernah Dihapus. | BR-013; BR-017 |
| **FR-011** | Menyediakan Batalkan Input dengan alasan wajib; proses tetap diizinkan walaupun dokter pernah melakukan input pelayanan; setelah proses status menjadi Tidak Aktif dan record_status menjadi Sudah Pernah Dihapus. | BR-015; BR-016 |
| **FR-012** | Menyediakan payload Resume Medis berdasarkan matriks status dan mengecualikan record Sudah Pernah Dihapus. | BR-018; BR-019; BR-020 |
| **FR-013** | Menampilkan record Sudah Pernah Dihapus pada tab Riwayat dan mencatat seluruh aktivitas pada Audit Trail. | BR-017; BR-021 |
| **FR-014** | Mempertahankan dokumentasi pelayanan dan dokter pembuat setelah Batalkan Input; pada CPPT yang verifikasi DPJP-nya Belum Diverifikasi, sistem hanya memperbarui dokter verifikator mengikuti DPJP Utama aktif terbaru. CPPT yang sudah diverifikasi tidak diubah otomatis. | BR-022; BR-023; BR-024 |
| **FR-015** | Mencegah perubahan dokter Alih Rawat/Tidak Aktif menjadi DPJP Utama melalui Edit Peran dan mengarahkan user menggunakan Tambah DPJP untuk membuat record aktif baru. | BR-025 |

## 12. User Stories

| ID | User Story | Acceptance Criteria | Trace |
|---|---|---|---|
| **US-001** | Sebagai petugas Rawat Inap, saya ingin menambah dr. Bekti dengan default Rawat Bersama agar proses input lebih cepat tetapi perannya tetap dapat diubah. | Given form Tambah DPJP terbuka, Then Peran default Rawat Bersama; When user memilih peran lain, Then dropdown menyimpan satu peran pilihan user. | FR-004; FR-008 |
| **US-009** | Sebagai petugas Rawat Inap, saya ingin perubahan Ubah DPJP setelah episode aktif tidak mengubah SPRI agar data episode Rawat Inap dikelola independen dari surat asal. | Given episode Rawat Inap sudah aktif, When data Ubah DPJP diubah, Then SPRI tidak diperbarui; When SPRI diubah dari pelayanan asal, Then daftar Ubah DPJP tidak berubah. | FR-003 |
| **US-002** | Sebagai petugas Rawat Inap, saya ingin menjadikan dr. Mia sebagai DPJP Utama agar tanggung jawab utama berpindah. | When dikonfirmasi, Then dr. Mia menjadi Utama Aktif dan dr. Adi menjadi Rawat Bersama Ganti Lead Aktif. | FR-007 |
| **US-003** | Sebagai petugas Rawat Inap, saya ingin mengubah dr. Adi menjadi Alih Rawat agar kewenangannya berakhir tetapi histori tetap tersedia. | When perubahan dikonfirmasi, Then dr. Adi menjadi Alih Rawat Tidak Aktif dan tetap tampil pada daftar utama serta tab Riwayat. | FR-008; FR-010 |
| **US-004** | Sebagai petugas Rawat Inap, saya ingin tetap dapat menambah dokter Rawat Bersama walaupun daftar sudah berisi dokter Alih Rawat/Tidak Aktif. | Given terdapat dokter Tidak Aktif, When saya klik + Dokter dan memilih Rawat Bersama, Then dokter baru berhasil ditambahkan sebagai Aktif. | FR-009 |
| **US-005** | Sebagai petugas Rawat Inap, saya ingin membatalkan dr. Bekti yang salah input meskipun ia sudah pernah melakukan input pelayanan. | When alasan dan konfirmasi dipenuhi, Then record menjadi Tidak Aktif + Sudah Pernah Dihapus, hilang dari daftar utama, tetapi tetap tampil pada tab Riwayat dan Audit Trail. | FR-011; FR-013 |
| **US-006** | Sebagai petugas rekam medis, saya ingin Resume Medis memisahkan dokter aktif dan tidak aktif yang valid serta mengecualikan record yang pernah dihapus. | Then Aktif masuk Dokter yang Merawat, Tidak Aktif valid masuk Riwayat, dan Sudah Pernah Dihapus tidak tampil. | FR-012 |
| **US-007** | Sebagai petugas Rawat Inap, saya ingin menetapkan kembali dokter Alih Rawat sebagai DPJP Utama melalui Tambah DPJP agar historical record lama tidak berubah. | Given dokter berstatus Tidak Aktif, When user mencoba memilih DPJP Utama melalui Edit Peran, Then sistem menolak dan mengarahkan ke Tambah DPJP; When ditambah kembali sebagai DPJP Utama, Then sistem membuat record aktif baru. | FR-015 |
| **US-008** | Sebagai petugas klinis, saya ingin isi CPPT tetap tersimpan ketika keterlibatan dokter dibatalkan, sementara penugasan verifikasi mengikuti DPJP aktif selama belum diverifikasi. | Given CPPT belum diverifikasi, When DPJP aktif berubah, Then hanya dokter verifikator DPJP yang diperbarui; isi dan dokter pembuat CPPT tetap. Given CPPT sudah diverifikasi, Then verifikasi tidak diubah otomatis. | FR-014 |

## 13. Data Requirements

### A. Header Informasi Form Ubah DPJP
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Nama Pasien | Data Pasien | Text | - | Read-only. |
| No. RM | Nomor Rekam Medis Pasien | Text | - | Read-only. |
| Tanggal Lahir | Data Pasien | `DD-MM-YYYY` | - | Read-only. |
| Jenis Kasus | Input SPRI | Text | - | Snapshot informasi saat pembentukan episode Rawat Inap; read-only pada form Ubah DPJP. |
| Ruang Perawatan | Input SPRI | Text | - | Snapshot informasi saat pembentukan episode Rawat Inap; read-only pada form Ubah DPJP. |

### B. Form Tambah/Edit DPJP
| Field | Label | Tipe | Wajib | Validasi | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| doctor_id | Nama Dokter | lookup dropdown | Ya | Dokter valid; record Tidak Aktif sebelumnya tidak memblok penambahan record aktif baru | Master Dokter | Dokter Alih Rawat dapat dipilih kembali melalui Tambah DPJP. |
| role | Peran | dropdown single select | Ya | DPJP Utama / Rawat Bersama / Rawat Bersama Ganti Lead / Alih Rawat | Default Rawat Bersama | User dapat mengganti default; menentukan status otomatis. |
| has_been_active_primary | Pernah DPJP Utama Aktif | boolean hidden | Sistem | Berdasarkan histori episode yang sama | Historical record | Mengontrol eligibility Rawat Bersama Ganti Lead. |
| involvement_status | Status Keterlibatan | enum read-only | Ya | Aktif / Tidak Aktif | Sistem | Alih Rawat = Tidak Aktif; selain Alih Rawat = Aktif. |
| record_status | Status Record | enum hidden | Ya | Valid / Sudah Pernah Dihapus | Default Valid | Batalkan Input mengubah menjadi Sudah Pernah Dihapus. |
| has_linked_services | Memiliki Pelayanan Terkait | boolean hidden | Sistem | Ya/Tidak | Modul pelayanan terkait | Tidak memblok Batalkan Input. |

### C. Form Batalkan Input
| Field | Label | Tipe | Wajib | Validasi | Sumber/Default | Catatan |
|---|---|---|---|---|---|---|
| cancel_reason | Alasan Batalkan Input | text input | Ya | Maksimal 200 karakter; tidak boleh hanya berisi spasi | Manual | Tidak menggunakan dropdown dan tidak memiliki field keterangan lainnya. |
| irreversible_ack | Konfirmasi proses tidak dapat dibatalkan | checkbox | Ya | Harus dicentang | Default tidak dicentang | Ditampilkan sebelum konfirmasi final. |

### D. Daftar Utama Ubah DPJP
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Nama Dokter | Snapshot dokter | Text | Search | Ikon mahkota untuk DPJP Utama. |
| Peran | Historical record | Badge | Filter | DPJP Utama / Rawat Bersama / Rawat Bersama Ganti Lead / Alih Rawat. |
| Status | involvement_status | Badge | Filter | Aktif / Tidak Aktif. |
| Aksi | Rule engine | Edit, Batalkan Input | - | Record Sudah Pernah Dihapus tidak tampil. |

### E. Tab Riwayat
| Kolom | Sumber Data | Format Tampilan | Filter/Sort | Catatan |
|---|---|---|---|---|
| Waktu | History/Audit | Timestamp | Terbaru lebih dulu | - |
| Dokter | Snapshot | Text | Search | Termasuk record Sudah Pernah Dihapus. |
| Aktivitas | History/Audit | Text | Filter | Tambah, Ubah Utama, Ubah Peran, Batalkan Input. |
| Peran | Historical record | Badge | Filter | Peran saat event terjadi. |
| Status | involvement_status | Badge | Filter | Aktif / Tidak Aktif. |
| Status Record | record_status | Badge | Filter | Valid / Sudah Pernah Dihapus. |
| Alasan | History/Audit | Text | - | Maksimal 200 karakter untuk Batalkan Input. |
| Pengguna | User | Text | Search | Aktor. |

## 14. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| **NFR-001** | Reliabilitas | Pergantian DPJP Utama harus atomik. |
| **NFR-002** | Auditabilitas | Batalkan Input tidak boleh menghapus tab Riwayat atau Audit Trail. |
| **NFR-003** | Integritas Rekam Medis | Pembatalan record DPJP tidak boleh menghapus atau mengubah dokumentasi pelayanan dan dokter pembuatnya. |
| **NFR-004** | Usability | Status Aktif, Tidak Aktif, dan Sudah Pernah Dihapus harus dibedakan dengan label teks. |
| **NFR-005** | Keamanan/RBAC | Aksi mengikuti permission final. |
| **NFR-006** | Konsistensi | Daftar Ubah DPJP, tab Riwayat, Resume Medis, CPPT, dan Audit Trail menggunakan event perubahan yang konsisten. SPRI hanya menjadi sumber pembentukan data awal sebelum episode Rawat Inap aktif dan tidak ikut diperbarui setelah episode aktif. |
| **NFR-007** | Ketertelusuran Klinis | Perubahan penugasan verifikator DPJP pada CPPT yang belum diverifikasi harus dapat ditelusuri tanpa mengubah author dan isi CPPT. |

## 15. Integrasi & Dependency

| Dependency | Tipe | Fungsi/Dampak |
|---|---|---|
| SPRI | Hard untuk initial seed | Menyediakan data awal dokter, jenis kasus, dan ruang perawatan sebelum episode Rawat Inap aktif. Tidak ada sinkronisasi dua arah setelah episode aktif. |
| TPPRI Rawat Inap | Hard | Menentukan episode aktif. |
| Master Dokter | Hard | Lookup dokter. |
| Resume Medis | Hard untuk output | Menampilkan dokter aktif dan riwayat dokter tidak aktif yang valid. |
| Tab Riwayat Ubah DPJP | Hard | Menampilkan record valid dan Sudah Pernah Dihapus. |
| Audit Trail | Hard | Menyimpan semua perubahan, termasuk Batalkan Input. |
| Modul Pelayanan Terkait | Soft | Menyediakan dokumentasi pelayanan yang tetap tersimpan; tidak memblok Batalkan Input. |
| CPPT | Hard untuk konsistensi verifikasi | Mempertahankan author/isi CPPT dan memperbarui penugasan verifikator yang belum diverifikasi mengikuti DPJP Utama aktif. |
| EMR — Tab Kunjungan & Riwayat Ubah DPJP | Soft / PRD terpisah | Akan menampilkan dokter yang merawat yang masih aktif pada tab Kunjungan dan tab Riwayat Ubah DPJP untuk record aktif maupun tidak aktif. Tidak menghambat fitur inti Ubah DPJP bila belum tersedia. |

## 16. Risk & Mitigation

| ID | Risiko | Mitigasi |
|---|---|---|
| R1 | Dua DPJP Utama aktif. | Transaksi atomik dan constraint server-side. |
| R2 | Status tidak sesuai dengan peran. | Hitung status di server berdasarkan peran; jangan menerima status manual dari client. |
| R3 | Record Sudah Pernah Dihapus muncul pada daftar utama atau Resume Medis. | Filter `record_status=Valid` secara eksplisit pada kedua konsumen. |
| R4 | Batalkan Input menghapus atau mengubah dokumentasi pelayanan yang sudah dibuat dokter. | Pisahkan record keterlibatan DPJP dari record pelayanan; pembatalan hanya memengaruhi keterlibatan dan penugasan verifikasi yang belum selesai. |
| R5 | User salah mengira Tidak Aktif sebagai data terhapus. | Tampilkan badge Tidak Aktif pada record Valid dan badge Sudah Pernah Dihapus hanya pada tab Riwayat. |
| R6 | CPPT yang sudah diverifikasi ikut berubah saat DPJP aktif berganti. | Hanya sinkronkan `assigned_verification_dpjp_id` pada CPPT berstatus Belum Diverifikasi; kunci snapshot verifikasi setelah selesai. |
| R7 | Historical record Alih Rawat tertimpa saat dokter kembali menjadi DPJP Utama. | Wajib menggunakan Tambah DPJP untuk membuat record baru; blok perubahan langsung melalui Edit Peran. |
| R8 | User mengira perubahan SPRI setelah episode aktif akan memperbarui Ubah DPJP, atau sebaliknya. | Tampilkan batas sinkronisasi pada dokumentasi proses dan pastikan backend menghentikan propagasi perubahan setelah episode Rawat Inap aktif. |

## 17. Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 21 Juli 2026 | Penyusunan awal. |
| 2.0 | 21 Juli 2026 | Scope Rawat Inap, 4 peran, sinkronisasi SPRI, Resume Medis, dan Audit Trail. |
| 3.0 | 21 Juli 2026 | Peran single select, validasi Rawat Bersama Ganti Lead, dan status Aktif/Tidak Aktif. |
| 4.0 | 21 Juli 2026 | Penyesuaian skenario pergantian DPJP, Alih Rawat, Batalkan Input, dan matriks Resume Medis. |
| 5.0 | 22 Juli 2026 | Menghapus aksi Akhiri Peran; status ditentukan otomatis berdasarkan peran; Batalkan Input tetap diperbolehkan meski dokter pernah melakukan pelayanan; record Sudah Pernah Dihapus disembunyikan dari daftar utama tetapi tampil pada tab Riwayat; serta penyesuaian seleksi dokter pada Resume Medis. |
| 6.0 | 22 Juli 2026 | Menetapkan dokumentasi pelayanan tetap tersimpan; mengatur auto-update penugasan verifikasi DPJP pada CPPT yang belum diverifikasi; menetapkan label riwayat **Sudah Pernah Dihapus**; mewajibkan Tambah DPJP untuk mengaktifkan kembali dokter Alih Rawat sebagai DPJP Utama; dan menetapkan default Peran Tambah DPJP = Rawat Bersama. |
| 7.0 | 22 Juli 2026 | Mengubah sinkronisasi SPRI menjadi initial seed saja sebelum episode Rawat Inap aktif; menambahkan related feature EMR pada tab Kunjungan dan tab Riwayat Ubah DPJP melalui PRD terpisah; mengubah alasan Batalkan Input menjadi text input maksimal 200 karakter; menghapus payload Resume Medis dan data CPPT dari Data Requirements; serta menambahkan header informasi pasien dan episode pada form Ubah DPJP. |

