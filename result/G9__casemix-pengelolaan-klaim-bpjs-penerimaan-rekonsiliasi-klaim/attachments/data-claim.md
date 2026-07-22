{Base URL}/{Service Name}/Monitoring/Klaim/Tanggal/{Parameter 1}/JnsPelayanan/{Parameter 2}/Status/{Parameter 3}
Fungsi : Data Klaim

Method : GET

Format : Json

Content-Type: application/json; charset=utf-8

Parameter 1 : Tanggal Pulang format: yyyy-mm-dd

Parameter 2 : Jenis Pelayanan (1. Inap 2. Jalan)

Parameter 3 : Status Klaim (1. Proses Verifikasi 2. Pending Verifikasi 3. Klaim)

```json                                    
                                        {
       "metaData": {
          "code": "200",
          "message": "Sukses"
       },
       "response": {
          "klaim": [
             {
                "Inacbg": {
                   "kode": "N-3-15-0",
                   "nama": "DIALYSIS"
                },
                "biaya": {
                   "byPengajuan": "991200",
                   "bySetujui": "0",
                   "byTarifGruper": "991200",
                   "byTarifRS": "1170689",
                   "byTopup": "0"
                },
                "kelasRawat": "3",
                "noFPK": "",
                "noSEP": "0301R00109170001280",
                "peserta": {
                   "nama": "NUR",
                   "noKartu": "0033681422715",
                   "noMR": "974956"
                },
                "poli": "Hemodialisa",
                "status": "Proses Verifikasi",
                "tglPulang": "2017-09-02",
                "tglSep": "2017-09-02"
             },
             {
                "Inacbg": {
                   "kode": "N-3-15-0",
                   "nama": "DIALYSIS"
                },
                "biaya": {
                   "byPengajuan": "991200",
                   "bySetujui": "0",
                   "byTarifGruper": "991200",
                   "byTarifRS": "1015000",
                   "byTopup": "0"
                },
                "kelasRawat": "3",
                "noFPK": "",
                "noSEP": "0301R00109170000094",
                "peserta": {
                   "nama": "YUH",
                   "noKartu": "0223416974628",
                   "noMR": "878410"
                },
                "poli": "Hemodialisa",
                "status": "Proses Verifikasi",
                "tglPulang": "2017-09-02",
                "tglSep": "2017-09-02"
             }
          ]
       }
    }
```