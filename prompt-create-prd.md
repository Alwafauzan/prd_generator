# Prompt Template — Create PRD

Salin prompt berikut, lalu ganti seluruh placeholder `[DIISI]` sesuai kebutuhan.

---

## Prompt

```text
Buatkan Product Requirement Document (PRD) untuk fitur berikut:

- Kode fitur: [DIISI — contoh: N14]
- Nama menu/fitur: [DIISI]
- Cluster/modul: [DIISI / BOLEH DICARI DARI SUMBER]
- Tingkat kematangan konsep: [FOUNDATION / CUKUP MATANG / FINAL DRAFT]
- Lokasi output: result/[KODE]__[SLUG-NAMA-FITUR]/

Konteks dan kebutuhan awal:
[DIISI — tuliskan kebutuhan, alur, kendala, dan keputusan yang sudah diketahui]

Sumber yang wajib digunakan:
1. template.md sebagai format utama.
2. Seluruh PRD terkait yang relevan di folder result.
3. Dokumen relevan di folder other_prd(prd_dari_google_drive) sebagai referensi read-only.
4. data/features-mvp.json dan sumber lokal lain yang relevan bila tersedia.
5. Lampiran khusus berikut bila ada:
   - [DIISI — path file Vue/PDF/gambar/Excel/dokumen lain]

ATURAN PENTING:
- Jangan pernah mengubah, memindahkan, menghapus, mengganti nama, atau memformat ulang file apa pun di folder other_prd(prd_dari_google_drive). Folder tersebut hanya boleh dibaca.
- Jangan mengubah file PRD lain yang tidak diminta, kecuali perubahan referensi silang memang diperlukan dan masih dalam scope. Jika tidak diperlukan, cukup cantumkan relasinya pada PRD baru.
- Bedakan fakta sumber, keputusan user, asumsi analis, dan pertanyaan terbuka.
- Jangan mengarang proses bisnis yang belum didukung sumber. Tandai dengan [ASUMSI] atau [PERLU KONFIRMASI].
- Jika konsep masih kasar, buat versi 0.1 dengan status foundation-draft. Fokus pada pondasi data, ownership, lifecycle/status, relasi modul, API, database, audit, dan extension point. Jangan memaksakan detail operasional menjadi keputusan final.
- Jika konsep cukup matang/final, gunakan versi 1.0 draft dan acceptance criteria yang lebih lengkap.
- Phase 1 berisi fungsi dasar/MVP. Approval, escalation, analytics, integrasi kompleks, dan otomatisasi lanjutan ditempatkan di Phase 2 jika belum dikonfirmasi.
- Status tidak dipilih bebas pada form create. Status awal ditetapkan sistem dan perubahan status hanya melalui aksi bisnis/state machine.
- Pertahankan data historis menggunakan snapshot, audit trail, versioning, soft delete, atau addendum sesuai karakter fitur.
- Gunakan nama tabel, kolom database, enum, dan endpoint API dalam bahasa Inggris.
- Acceptance criteria harus spesifik, testable, dan konsisten dengan business rules serta state machine.
- Jika nama menu memakai istilah internal yang ambigu, definisikan maknanya secara eksplisit. Contoh: “Dashboard” dapat berarti operational worklist/list data, bukan dashboard analitik.

LANGKAH KERJA:
1. Baca template.md secara lengkap.
2. Cari kode/nama fitur dan relasinya dalam data/features-mvp.json, result, dan other_prd(prd_dari_google_drive).
3. Baca sumber yang paling relevan secara lengkap atau pada bagian yang diperlukan.
4. Buat ringkasan evidence:
   - Fakta yang didukung sumber.
   - Keputusan eksplisit dari user.
   - Konflik/ketidakjelasan antar-sumber.
   - Asumsi yang dibutuhkan.
5. Tentukan batas ownership fitur terhadap modul hulu/hilir agar tidak terjadi duplikasi tanggung jawab.
6. Susun PRD menggunakan sembilan bagian template.md:
   1. Metadata Dokumen
   2. Overview & Background
   3. Goals & Metrics
   4. Scope Definition & Phasing
   5. Related Features
   6. Business Process & User Stories
   7. Functional Requirements
   8. Data & Technical Specifications
   9. Workflow / BPMN Interpretation
7. Tambahkan bagian Asumsi dan Pertanyaan Terbuka setelah bagian 9.
8. Buat meta.json yang valid.
9. Validasi struktur, JSON, referensi silang, status, API, schema, business rules, dan acceptance criteria.

OUTPUT WAJIB:
- result/[KODE]__[SLUG-NAMA-FITUR]/[KODE]__[SLUG-NAMA-FITUR].md
- result/[KODE]__[SLUG-NAMA-FITUR]/meta.json

Format meta.json minimum:
{
  "code": "[KODE]",
  "title": "[NAMA FITUR]",
  "cluster": "[CLUSTER]",
  "module": "[MODUL]",
  "version": "[0.1 atau 1.0]",
  "date": "[TANGGAL HARI INI]",
  "status": "[foundation-draft atau draft]",
  "primary_file": "[NAMA FILE].md",
  "related_features": ["[KODE TERKAIT]"]
}

KETENTUAN MODE FOUNDATION:
- Tambahkan disclaimer jelas di bagian atas bahwa konsep belum final.
- Jangan menyimpulkan field wajib, role, trigger, approval, integrasi, atau status final tanpa sumber.
- Buat model data yang extensible dan hindari hardcode aturan yang masih berubah.
- Tulis pertanyaan terbuka berdasarkan prioritas keputusan yang paling memengaruhi arsitektur.

Sebelum selesai, laporkan:
- File yang dibuat.
- Ringkasan scope Phase 1 dan Phase 2.
- Keputusan desain penting.
- Asumsi/pertanyaan paling kritis.
- Konfirmasi bahwa folder other_prd(prd_dari_google_drive) tidak diubah.
```

---

## Contoh Input Singkat

```text
- Kode fitur: N14
- Nama menu/fitur: Dashboard Patologi Anatomi
- Cluster/modul: Pelayanan Pendukung / Patologi Anatomi
- Tingkat kematangan konsep: FOUNDATION
- Kebutuhan awal: Saat menu dibuka tampil list order. User dapat mencari, filter, melihat status, dan membuka detail untuk memproses order.
- Catatan istilah: Dashboard berarti operational worklist, bukan grafik/KPI.
```

## Checklist Pengguna

Sebelum menjalankan prompt, usahakan melengkapi:

- Kode dan nama menu.
- Apakah konsep masih kasar atau sudah cukup matang.
- Trigger atau sumber data utama.
- Role pengguna yang sudah diketahui.
- File referensi khusus.
- Keputusan yang tidak boleh diasumsikan.

