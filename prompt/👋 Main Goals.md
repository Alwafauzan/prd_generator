👋 Main Goals

Meningkatkan pengalaman pengguna (User Experience) pada fitur Asesmen Awal Keperawatan Rawat Inap Anak dengan menyederhanakan tampilan formulir sehingga proses pengisian asesmen menjadi lebih cepat, nyaman, dan efisien tanpa mengubah alur bisnis maupun struktur data yang sudah ada.



📝 Feature Capabilities





Menampilkan seluruh formulir asesmen dalam continuous form (single page) tanpa pemisahan section ke dalam panel atau halaman terpisah.



Mengurangi white space sehingga lebih banyak informasi dapat ditampilkan dalam satu layar.



Menambahkan Section Navigation sebagai shortcut menuju setiap bagian asesmen.



Mendukung perpindahan cepat antar section tanpa harus melakukan scrolling panjang.



Tetap mempertahankan seluruh field, validasi, dan struktur data yang telah ada pada V1.



Tetap kompatibel dengan proses penyimpanan dan tampilan data EMR yang sudah berjalan.



⚙️Performance Expectation

Behavior :





Form asesmen ditampilkan dalam satu halaman secara berurutan (continuous scrolling).



Pengguna dapat langsung melakukan scrolling untuk mengisi seluruh asesmen.



Section Navigation dapat dipilih kapan saja untuk berpindah ke bagian tertentu.



Perpindahan ke section dilakukan secara otomatis (scroll to section) tanpa melakukan reload halaman.



Pengguna tetap dapat mengubah data pada section mana pun tanpa kehilangan data yang telah diinput sebelumnya.



Penyimpanan data tetap menggunakan mekanisme yang sama seperti V1.

Ekspektasi :





Tampilan form lebih ringkas dibandingkan V1.



Pengguna membutuhkan lebih sedikit scrolling untuk melihat informasi.



Navigasi antar section menjadi lebih cepat.



Pengisian asesmen menjadi lebih efisien terutama pada form dengan jumlah field yang banyak.



Tidak terdapat perubahan terhadap performa penyimpanan maupun pengambilan data.



🧩Scope





Redesign layout Asesmen Awal Keperawatan Rawat Inap Anak.



Pengurangan margin, padding, dan white space yang tidak diperlukan.



Penyusunan ulang seluruh section menjadi satu halaman (continuous form).



Penambahan komponen Section Navigation sebagai shortcut menuju setiap kelompok asesmen.



Penyesuaian responsive layout agar tetap nyaman digunakan pada berbagai resolusi layar.



Penyesuaian posisi section sehingga navigasi dapat mengarahkan pengguna ke lokasi yang tepat.



Tidak termasuk perubahan struktur database.



Tidak termasuk perubahan business process.



Tidak termasuk penambahan maupun pengurangan field asesmen.



📈Expected Improvement From V1

Aspek Bisnis Proses :

Tidak terdapat perubahan proses bisnis.

Alur asesmen tetap:

Perawat membuka asesmen → Mengisi seluruh data → Menyimpan asesmen → Data digunakan sebagai dokumentasi EMR dan dasar penyusunan asuhan keperawatan.



Aspek User Experience :





Form tidak lagi dipisahkan ke dalam section-panel yang panjang.



Seluruh formulir ditampilkan dalam satu halaman sehingga pengguna cukup melakukan scrolling ke bawah.



White space dikurangi agar informasi lebih padat dan efisien.



Ditambahkan Section Navigation yang memungkinkan pengguna berpindah langsung ke bagian asesmen yang diinginkan.



Layout dibuat lebih konsisten sehingga mengurangi waktu pencarian field saat pengisian maupun revisi data.



Pengalaman penggunaan menjadi lebih sederhana, cepat, dan intuitif.



Aspek Logic System :

Tidak terdapat perubahan terhadap:





Struktur data asesmen.



Mekanisme penyimpanan data.



Validasi field.



Hak akses pengguna.



Integrasi dengan EMR.



Proses pembacaan data asesmen.

Perubahan hanya dilakukan pada lapisan antarmuka (UI/UX).