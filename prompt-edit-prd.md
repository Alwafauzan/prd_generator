# Prompt Template — Edit PRD ketika Konsep Berubah

Gunakan prompt ini untuk merevisi PRD tanpa kehilangan histori keputusan, acceptance criteria, atau relasi teknis.

---

## Prompt

```text
Edit PRD berikut karena terdapat perubahan konsep:

- Kode fitur: [DIISI]
- Nama fitur saat ini: [DIISI]
- File PRD utama: [DIISI — path lengkap di result]
- File metadata: [DIISI — path meta.json]
- Jenis perubahan: [RENAME / PERUBAHAN SCOPE / PEMISAHAN MENU / PENGGABUNGAN MENU / PERUBAHAN ALUR / PERUBAHAN DATA / PERUBAHAN INTEGRASI / PERUBAHAN STATUS / LAINNYA]
- Tingkat kematangan setelah revisi: [FOUNDATION / CUKUP MATANG / FINAL DRAFT]

Konsep lama:
[DIISI — ringkas konsep yang saat ini tertulis]

Konsep baru/keputusan terbaru:
[DIISI — jelaskan perubahan secara eksplisit]

Alasan perubahan:
[DIISI / OPSIONAL]

Sumber baru atau referensi tambahan:
- [DIISI — path file/dokumen]

ATURAN PENTING:
- Baca PRD existing dan meta.json secara lengkap sebelum mengedit.
- Gunakan template.md untuk menjaga struktur.
- Gunakan PRD terkait di result dan dokumen relevan di other_prd(prd_dari_google_drive) sebagai referensi.
- Jangan pernah mengubah, memindahkan, menghapus, mengganti nama, atau memformat ulang file apa pun di folder other_prd(prd_dari_google_drive). Folder tersebut read-only.
- Jangan sekadar mengganti nama/judul. Telusuri dampak perubahan ke overview, As-Is/To-Be, goals, scope, related features, user stories, state machine, FR/AC, validasi, database, API, business rules, workflow, asumsi, pertanyaan terbuka, dan metadata.
- Keputusan terbaru dari user mengalahkan asumsi lama. Sumber yang masih relevan tetap dipertahankan.
- Jika konsep baru bertentangan dengan sumber lama, jelaskan sebagai perubahan keputusan atau gap; jangan menyembunyikan konflik.
- Jangan menghapus histori penting. Tambahkan baris Document Version yang menjelaskan perubahan.
- Jangan mempertahankan requirement lama yang sudah tidak berlaku hanya karena masih ada di bagian lain.
- Jangan mengubah PRD terkait di luar scope kecuali referensi silangnya menjadi salah secara material. Jika perlu mengubah file lain, batasi hanya pada referensi yang terdampak dan laporkan.
- Pertahankan compatibility data historis. Jika schema/status berubah, jelaskan migration/backfill/mapping dan perilaku record lama.
- Acceptance criteria harus diperbarui agar menguji konsep baru, bukan konsep lama.
- API, database, enum, state machine, dan business rules harus konsisten satu sama lain.

LANGKAH ANALISIS DAMPAK:
1. Baca PRD existing, meta.json, template.md, dan sumber baru.
2. Buat matriks perubahan internal:
   - Tetap.
   - Diubah.
   - Dihapus dari scope.
   - Baru ditambahkan.
   - Masih perlu konfirmasi.
3. Cari seluruh penyebutan kode/nama fitur lama di folder result.
4. Tentukan apakah perubahan hanya internal PRD atau berdampak pada PRD terkait.
5. Audit bagian berikut satu per satu:
   - Judul, kode, slug/path, metadata.
   - Overview dan definisi istilah.
   - As-Is dan To-Be.
   - Goals/metrics.
   - Phase 1, Phase 2, dan Out of Scope.
   - Related Features dan ownership hulu/hilir.
   - User stories dan role.
   - State machine/transisi.
   - Functional requirements dan acceptance criteria.
   - Validasi frontend.
   - Database schema, constraints, snapshots, audit/versioning.
   - API endpoint dan idempotency.
   - Business rules.
   - Workflow.
   - Asumsi dan pertanyaan terbuka.
6. Naikkan versi:
   - Perubahan kecil/clarification: 1.0 → 1.1 atau 0.1 → 0.2.
   - Perubahan besar tetapi masih draft: gunakan versi minor/major sesuai konvensi proyek.
   - Jangan mengubah foundation-draft menjadi draft/final tanpa dasar yang cukup.
7. Perbarui meta.json dan related_features.
8. Validasi hasil dan cari sisa istilah/konsep lama menggunakan pencarian teks.

PERATURAN KHUSUS BERDASARKAN JENIS PERUBAHAN:

A. Jika RENAME:
- Ubah judul PRD dan metadata.
- Periksa seluruh penyebutan nama lama.
- Ubah folder/file hanya jika diminta atau diperlukan oleh konvensi; jangan membuat duplikat file kanonik.

B. Jika PEMISAHAN MENU:
- Tetapkan ownership masing-masing menu.
- Pindahkan requirement ke PRD yang benar, jangan menduplikasi proses.
- Definisikan handoff/event/API/status antar-menu.
- Perbarui Related Features kedua PRD.

C. Jika PENGGABUNGAN MENU:
- Pilih satu aggregate/source of truth.
- Jelaskan migrasi kode/menu lama dan kompatibilitas referensi.
- Hindari dua state machine atau tabel yang mengelola objek bisnis sama.

D. Jika PERUBAHAN ALUR/STATUS:
- Perbarui state machine, transition guard, UI action, API, enum DB, audit, dan AC.
- Jelaskan mapping status lama ke status baru.

E. Jika PERUBAHAN DATA/MASTER:
- Tentukan data canonical, snapshot transaksi, FK, duplicate prevention, dan migrasi.
- Jangan menyimpan data transaksi sebagai atribut master jika nilainya bergantung konteks transaksi.

F. Jika konsep masih kasar:
- Pertahankan/ubah status menjadi foundation-draft.
- Pindahkan keputusan belum pasti ke [PERLU KONFIRMASI].
- Fokus pada pondasi dan extension point.

OUTPUT:
- Edit file PRD existing secara langsung; jangan membuat versi duplikat kecuali diminta.
- Edit meta.json terkait.
- Edit PRD lain hanya bila referensi silang benar-benar terdampak.

LAPORAN AKHIR WAJIB:
1. File yang diubah/dibuat.
2. Ringkasan konsep lama → konsep baru.
3. Requirement yang dipindahkan, ditambah, atau dihapus dari scope.
4. Dampak pada state machine, API, database, dan PRD terkait.
5. Asumsi dan pertanyaan yang masih terbuka.
6. Hasil validasi: JSON valid, struktur lengkap, tidak ada istilah lama yang tertinggal secara salah.
7. Konfirmasi bahwa folder other_prd(prd_dari_google_drive) tidak diubah.
```

---

## Contoh — Pemisahan Menu

```text
- Kode fitur: N6
- Nama saat ini: Menu Ambulance
- Jenis perubahan: PEMISAHAN MENU

Konsep lama:
N6 menangani pembentukan order sampai penyelesaian layanan ambulance.

Konsep baru:
- N6 diubah menjadi Konfirmasi Ambulance: worklist permintaan, konfirmasi, proses, selesai, batal, dan riwayat.
- N7 menjadi Order Ambulance: dibentuk dari tindakan, melengkapi pasien, rute, RS, jarak, fee, dan driver sebelum diserahkan ke N6.

Sumber baru:
- bahan_random/Ambulance.vue
- bahan_random/OrderAmbulance.vue
```

## Checklist Review Perubahan

- Apakah versi dan changelog diperbarui?
- Apakah requirement lama masih tersisa di owner yang salah?
- Apakah handoff antar-menu jelas?
- Apakah status dan transisi konsisten?
- Apakah API dan database masih memakai istilah lama?
- Apakah histori/migrasi data lama dijelaskan?
- Apakah PRD terkait perlu memperbarui referensi?
- Apakah semua asumsi lama masih valid?

