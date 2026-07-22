# Product Requirement Document (PRD) Template

Instruksi untuk LLM:
Gunakan template di bawah ini untuk menyusun PRD. Perhatikan aturan berikut:
1. **Phasing Strategy**: Fokuskan Phase 1 pada CRUD dan fungsionalitas dasar (tanpa approval berjenjang), namun rancang arsitektur data agar siap untuk implementasi approval berjenjang di Phase 2.
2. **Business Process**: Wajib menyertakan analisis "As-Is" (manual/masalah) dan "To-Be" (solusi digital/workflow).
3. **Acceptance Criteria**: Harus sangat spesifik dan testable.
4. **Technical Context**: Sertakan rekomendasi struktur tabel database (English) dan endpoint API (English).
5. **Related Features**: Jika tidak ada instruksi relasi fitur, kosongkan bagian ini.

---

## 1. Metadata Dokumen
* **Approval**: [Nama Stakeholder, Jabatan, Tanggal]
* **Related Documents**: [Tautkan link/dokumentasi terkait]
* **Document Version**: [Tanggal, Versi, Deskripsi Perubahan]

## 2. Overview & Background
* **Overview/Brief Summary**: [Ringkasan fitur]
* **Business Process (As-Is vs To-Be)**:
    * **As-Is**: [Proses manual saat ini dan kendala operasionalnya]
    * **To-Be**: [Workflow digital baru yang diusulkan]

## 3. Goals & Metrics
| No | Metrics | Success Criteria |
|----|---------|------------------|
| 1  | [Metrik] | [Target Keberhasilan] |

## 4. Scope Definition & Phasing
| Fitur/Modul | Phase 1 (MVP: CRUD) | Phase 2 (Advanced: Approval/Escalation) |
|-------------|---------------------|-----------------------------------------|
| [Modul A]   | [Fungsi CRUD Dasar] | [Workflow Approval, Escalation]         |

**Out of Scope**: [Daftar fitur/proses yang tidak akan dikembangkan dalam PRD ini]

## 5. Related Features
* [Jika tidak ada instruksi, tulis: "N/A"]
* [Jika ada instruksi, jelaskan: Kode Fitur + Deskripsi Relasi Teknis/Bisnis]

## 6. Business Process & User Stories
* **State Machine Table**:
| Status | Deskripsi | Efek Stok | Transisi (Phase 1) | Transisi (Phase 2) |
|--------|-----------|-----------|--------------------|--------------------|
| [Status] | [Deskripsi] | [Efek] | [Next] | [Next + Approval] |

* **User Stories Utama**: [Role-Task-Goal]

## 7. Functional Requirements
### 7.1 Feature Requirements & Acceptance Criteria
*Struktur wajib untuk setiap fitur:*

**Fitur: [Nama Fitur]**
* **User Story**: Sebagai [Role], saya ingin [Task], agar [Goal].
* **Prioritas**: [P0-P4]
* **Fase**: [Phase 1 / Phase 2]
* **Acceptance Criteria**:
    * **AC 1**: [Kriteria testable 1]
    * **AC 2**: [Kriteria testable 2]

* **Validasi**:

  **A. Wording Validasi (Frontend)**
  | Field | Tipe Input | Rules | Error Message | Helper Text |
  |-------|------------|-------|---------------|-------------|
  | [Contoh: Nama] | Text | Required, Max 50 | "Nama wajib diisi" | "Masukkan nama lengkap" |

## 8. Data & Technical Specifications
### 8.1 Database Schema Suggestion
* **Table Name**: `[english_table_name]`
* **Key Columns**:
    * `id`: UUID (Primary Key)
    * `is_active`: Boolean (default true)
    * `[Field Lain]`: [Tipe Data]

### 8.2 API Endpoint Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/...` | List data |
| POST   | `/api/v1/...` | Create data |
| PATCH  | `/api/v1/...` | Toggle Active/Inactive |

### 8.3 Data & Business Rules
#### 8.3.1 Spesifikasi Data — Form Input (Layar CREATE/EDIT)
| Field | Label | Tipe | Wajib | Validasi | Sumber | Catatan |
|-------|-------|------|-------|----------|--------|---------|
| [Field] | [Label] | [Tipe] | [Ya/Tidak] | [Rules] | [Sumber] | [Catatan] |

#### 8.3.2 Spesifikasi Data — Tampilan Daftar (List View)
| Kolom | Sumber Data | Format | Filter / Sort | Catatan |
|-------|-------------|--------|---------------|---------|
| [Kolom] | [Field] | [Format] | [Filter/Sort] | [Catatan] |

* **Business Rules**: [Aturan spesifik: FEFO, Reservation, dll]

## 9. Workflow / BPMN Interpretation
* [Deskripsi alur berdasarkan BPMN]

---

### Panduan Tambahan untuk LLM:
1. **Fase 1 (MVP)**: Implementasikan logika CRUD sederhana. Jika fitur melibatkan proses bisnis yang butuh approval di masa depan (Phase 2), pastikan desain database sudah mengakomodasi kolom `status_approval` atau `role_approver` sejak awal.
2. **Acceptance Criteria**: Setiap AC harus sinkron dengan fase yang ditentukan.
3. **Status Behavior**: Jangan sediakan input status di form create. Status selalu diset `AKTIF` oleh sistem. Pengelolaan aktif/nonaktif dilakukan di level Dashboard (toggle).
4. **Consistency**: Pastikan API dan Struktur Tabel yang diusulkan selaras dengan *Business Rules*.
5. **Konsistensi**: Pastikan deskripsi "To-Be" di poin 2 sejalan dengan *State Machine* dan *Acceptance Criteria*.