# -*- coding: utf-8 -*-
"""
Script Generator Dokumen Word Panduan Lengkap AURA NEXT GEN
Spesifikasi Dokumen:
- Margin: Narrow (0.5 in / 1.27 cm di semua sisi)
- Ukuran Font: 14pt untuk teks dasar (body)
- Warna Font: Hitam pekat (#000000)
- Visual Menarik: Callout box, tabel rapi, heading hierarchy jelas, bullet points bersih
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_aura_guide():
    doc = Document()
    
    # 1. Konfigurasi Margin Narrow (0.5 inch / 720 dxa)
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
    
    # 2. Konfigurasi Default Style (Font 14pt, Warna Hitam Pekat)
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(14)
    font.color.rgb = RGBColor(0, 0, 0) # Hitam dasar
    style.paragraph_format.line_spacing = 1.15
    style.paragraph_format.space_after = Pt(6)
    
    # Helper Functions
    def add_p(text="", bold=False, italic=False, space_after=6, space_before=0, align=WD_ALIGN_PARAGRAPH.LEFT):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if text:
            run = p.add_run(text)
            run.font.name = 'Calibri'
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(0, 0, 0)
            run.bold = bold
            run.italic = italic
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(20)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        
        # Garis bawah pemisah aksen elegan
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="18" w:space="4" w:color="0284C7"/></w:pBdr>')
        p._p.get_or_add_pPr().append(pBdr)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(14.5)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        
        run_b = p.add_run(bold_prefix)
        run_b.font.name = 'Calibri'
        run_b.font.size = Pt(14)
        run_b.font.color.rgb = RGBColor(0, 0, 0)
        run_b.bold = True
        
        run_t = p.add_run(text)
        run_t.font.name = 'Calibri'
        run_t.font.size = Pt(14)
        run_t.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    def set_cell_shading(cell, color_hex):
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    def add_callout(title, paragraphs, border_hex="0284C7", bg_hex="F8FAFC"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(7.5) # full width narrow margin
        
        set_cell_shading(cell, bg_hex)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders_xml = f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_hex}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
        '''
        tcPr.append(parse_xml(borders_xml))
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        r_title = p.add_run(f"📌 {title}")
        r_title.bold = True
        r_title.font.name = 'Calibri'
        r_title.font.size = Pt(14)
        r_title.font.color.rgb = RGBColor(0, 0, 0)
        
        for text in paragraphs:
            p_item = cell.add_paragraph()
            p_item.paragraph_format.space_before = Pt(2)
            p_item.paragraph_format.space_after = Pt(4)
            p_item.paragraph_format.line_spacing = 1.15
            r_item = p_item.add_run(text)
            r_item.font.name = 'Calibri'
            r_item.font.size = Pt(13.5)
            r_item.font.color.rgb = RGBColor(0, 0, 0)
        
        add_p("", space_after=4)

    # ========================================================
    # HEADER DOKUMEN / JUDUL UTAMA
    # ========================================================
    p_title = add_p("PANDUAN LENGKAP & ALUR KERJA AURA NEXT GEN", bold=True, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    p_title.runs[0].font.size = Pt(22)
    
    p_sub = add_p("Penjelasan Sistematis Arsitektur, Cara Kerja, dan 9 Fitur Utama untuk Pemilik Sistem", italic=True, space_after=6, align=WD_ALIGN_PARAGRAPH.CENTER)
    p_sub.runs[0].font.size = Pt(15)
    
    p_meta = add_p("Format: Font 14pt · Margin: Narrow (0.5 in) · Teks Dasar: Hitam Pekat · Status: 100% Selesai & Terverifikasi", space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    p_meta.runs[0].font.size = Pt(12)
    p_meta.runs[0].font.color.rgb = RGBColor(80, 80, 80)

    add_callout("CATATAN DARI ASISTEN UNTUK ANDA", [
        "Halo! Dokumen ini sengaja ditulis dengan bahasa yang santai, terstruktur, dan sangat mudah dipahami dari nol.",
        "Jika tadi selama pengerjaan Anda merasa cuma 'iya-iya aja' dan belum paham alur teknisnya, itu sangat wajar karena proyek ini melibatkan banyak lapisan (Web, Cloud Firebase, AI Gemini/Ollama, dan Mikrokontroler ESP32).",
        "Setelah membaca panduan ini langkah demi langkah, Anda akan paham 100% apa saja yang ada di dalam laptop/komputer Anda, bagaimana masing-masing fitur bekerja, dan bagaimana cara memakainya sehari-hari."
    ], border_hex="0284C7", bg_hex="F0F9FF")

    # ========================================================
    # BAB 1: APA SEBENARNYA AURA NEXT GEN ITU?
    # ========================================================
    add_h1("BAB 1: Pengenalan AURA NEXT GEN - Apa Sebenarnya Proyek Ini?")
    
    add_p("AURA NEXT GEN adalah asisten cerdas pribadi (Personal AI Assistant) masa depan yang menggabungkan 3 dunia sekaligus dalam satu wadah:")
    add_bullet("1. Otak Kecerdasan Buatan (AI Engine): ", "Ditenagai oleh Google Gemini (Cloud AI) atau Ollama (Local AI yang jalan offline tanpa internet di laptop Anda). AURA bisa diajak mengobrol, tanya jawab, menganalisis data, dan mengingat konteks percakapan.")
    add_bullet("2. Dashboard Antarmuka Visual (Web Frontend): ", "Berjalan di file index.html pada browser Anda dengan desain VisionOS Dark Glassmorphism (kaca gelap futuristik, animasi partikel celestial, wajah robot hidup yang matanya mengikuti kursor, dan efek glow cyan halus).")
    add_bullet("3. Kendali Fisik Dunia Nyata (Hardware ESP32): ", "Terhubung ke mikrokontroler ESP32 melalui WiFi, sehingga AURA bisa membaca sensor suhu, kelembaban, keberadaan manusia lewat radar, sensor cahaya, memutar motor servo, dan menyalakan/mematikan lampu atau kipas lewat relay.")

    add_p("Singkatnya: AURA bukan sekadar chat AI biasa seperti ChatGPT di browser, melainkan AI interaktif yang punya tubuh fisik di dunia nyata lewat alat ESP32 Anda!")

    # ========================================================
    # BAB 2: ARSITEKTUR & BAGAIMANA SEMUANYA TERHUBUNG
    # ========================================================
    add_h1("BAB 2: Arsitektur & Bagaimana Semua Komponen Terhubung")
    
    add_p("Banyak orang bingung: 'Bagaimana bisa halaman web di laptop saya bisa menyuruh alat ESP32 bergerak tanpa kabel USB?' Jawabannya adalah melalui Cloud Firebase.")
    
    add_p("Berikut adalah 4 pilar utama sistem AURA NEXT GEN:")
    
    add_bullet("1. Laptop / Komputer Anda (Browser index.html): ", "Ini adalah stasiun kendali utama tempat Anda melihat grafik, membaca catatan, melihat radar cuaca, dan mengetik/berbicara ke AURA.")
    add_bullet("2. Cloud Firebase Realtime Database: ", "Ini adalah papan tulis online bersama di internet (Google Firebase). Ketika Anda menggeser slider servo di web, web menulis angka ke Firebase. ESP32 yang terhubung ke WiFi membaca angka itu setiap 600 milidetik.")
    add_bullet("3. Alat Fisik ESP32 (Microcontroller): ", "ESP32 membaca perintah dari Firebase dan mengeksekusinya ke pin kabel: memutar servo di GPIO 18, mengklik saklar relay di GPIO 25, 27, 5, 15, atau mengirim data suhu DHT22 kembali ke web.")
    add_bullet("4. Layanan AI (Gemini / Ollama): ", "Saat Anda mengetik pertanyaan umum atau menyuruh AI berpikir, web mengirim prompt ke Gemini API atau ke server Ollama lokal di laptop Anda.")

    add_callout("ALUR KOMUNIKASI 3 ARAH (SEDERHANA)", [
        "• Anda menekan tombol di Web  ➔  Web mengirim data ke Firebase RTDB.",
        "• ESP32 membaca Firebase via WiFi  ➔  ESP32 memutar Servo atau menyalakan Relay.",
        "• ESP32 membaca Sensor Suhu & Radar  ➔  ESP32 mengirim data ke Firebase  ➔  Web menampilkannya di layar Anda secara realtime."
    ], border_hex="10B981", bg_hex="F0FDF4")

    # ========================================================
    # BAB 3: BEDAH TUNTAS 9 FITUR YANG BARU SAJA DIBUAT
    # ========================================================
    add_h1("BAB 3: Bedah Tuntas 9 Fitur Baru yang Telah Dibangun")
    add_p("Berikut adalah rincian lengkap 9 fitur yang baru saja kita selesaikan hari ini, mulai dari latar belakang, cara kerja di balik layar, hingga cara menggunakannya.")

    # FITUR 1: GLITCH
    add_h2("1. Animasi Glitch Teks AURA (#7)")
    add_p("• Masalah Sebelumnya: Logo teks 'AURA' di tengah layar terkesan kaku dan statis.")
    add_p("• Solusi yang Dibuat: Kita membuat sistem animasi canvas modern di script 4 index.html. Efek ini menghasilkan getaran futuristik dengan pergeseran warna merah-sian (RGB split), glitch potongan horizontal acak, dan aksen glow halus saat sistem idle maupun saat berpikir.")
    add_p("• Cara Menikmatinya: Efek glitch berjalan otomatis secara natural di latar tengah layar, memberikan nuansa hidup pada sistem AURA seperti kecerdasan buatan di film fiksi ilmiah.")

    # FITUR 2: MULTI-API KEY & FALLBACK
    add_h2("2. Multi-API Key & Combo Auto-Fallback (#8)")
    add_p("• Masalah Sebelumnya: Dulu sistem hanya bisa memakai satu API Key Google Gemini. Jika kuota gratis harian Google habis (Error 429 Resource Exhausted), sistem langsung mogok dan tidak bisa menjawab chat.")
    add_p("• Solusi yang Dibuat: Kita menambahkan modul 'Multi-API Key Manager'. Anda bisa memasukkan hingga 5 kunci API Gemini sekaligus.")
    add_p("• Cara Kerjanya: Jika Kunci #1 habis kuota atau error, AURA otomatis beralih ke Kunci #2 dalam hitungan milidetik tanpa memutus percakapan. Jika semua kunci cloud habis, sistem otomatis menyarankan fallback ke Local AI (Ollama).")
    add_p("• Cara Pakainya: Buka panel menu kanan (Drawer), klik tombol 'AI Key: Configure'. Masukkan kunci-kunci Gemini Anda di sana, lalu klik Simpan.")

    # FITUR 3: NOTEPAD & GOALS
    add_h2("3. Notepad & Goals - Catatan & Target Harian (#1)")
    add_p("• Masalah Sebelumnya: Pengguna sering ingin mencatat ide, prompt bagus, atau target harian tanpa harus membuka aplikasi lain seperti Word atau Notepad Windows.")
    add_p("• Solusi yang Dibuat: Modal pintar 'AURA Notepad & Goals' dengan tab Catatan & Ide, tab Goals (Target Harian) berprogress-bar, dan tab Pengingat.")
    add_p("• Fitur Keren 'Ask AI': Di dalam catatan, ada tombol 'Ask AI' yang langsung memindahkan isi catatan ke kolom tanya jawab AURA agar bisa dirangkum atau dianalisis otomatis.")
    add_p("• Preview Widget: Tampil di Kolom 1 (paling atas) di sebelah kiri layar, menampilkan snippet isi catatan terakhir dan persentase target harian yang sudah Anda capai.")

    # FITUR 4: NOTIFICATION REMINDER
    add_h2("4. Notification & Reminder Scheduler (#2)")
    add_p("• Masalah Sebelumnya: Tidak ada alarm atau pengingat jika kita sedang fokus bekerja di depan layar.")
    add_p("• Solusi yang Dibuat: Sistem scheduler realtime yang memeriksa waktu setiap detik. Mendukung input manual di modal catatan dan natural language via kolom chat.")
    add_p("• Contoh Perintah: Ketik di chat: 'ingatkan saya minum obat 30 menit' atau 'ingatkan saya rapat 1 jam'. AURA akan menjawab 'Pengingat berhasil dijadwalkan!'")
    add_p("• Saat Alarm Berbunyi: Muncul banner alert bercahaya di atas layar disertai bunyi beep audio synthesizer frekuensi tinggi yang menarik perhatian.")

    # FITUR 5: HISTORY OF CHAT
    add_h2("5. History of Chat - Arsip Riwayat Chat Lengkap (#3)")
    add_p("• Masalah Sebelumnya: Chat lama yang terlewat sulit dicari kembali jika halaman direfresh.")
    add_p("• Solusi yang Dibuat: Modal arsip riwayat chat cerdas (`#chatHistoryModal`). Dilengkapi fitur pencarian kata kunci instan, penyaringan berdasarkan mode (Cloud / Local AI), tombol salin pesan, serta tombol ekspor ke file teks (.txt).")
    add_p("• Preview Widget: Tampil di Kolom 3 (di bawah cuaca), memperlihatkan jumlah pesan tersimpan dan cuplikan obrolan terakhir.")

    # FITUR 6: CUACA CANGGIH & RADAR
    add_h2("6. Dashboard Monitor Cuaca Canggih (#9)")
    add_p("• Masalah Sebelumnya: Data cuaca di bar atas hanya menampilkan teks angka suhu dingin tanpa prakiraan ke depan.")
    add_p("• Solusi yang Dibuat: Integrasi Open-Meteo Global Meteorological API langsung tanpa perlu API key berbayar. Menampilkan radar suhu, terasa seperti (feels like), kelembaban relatif, kecepatan angin, curah hujan, UV index, prakiraan jam-demi-jam 24 jam ke depan, dan prakiraan 7 hari ke depan.")
    add_p("• Pilihan Kota Cepat: Pemalang, Jakarta, Bandung, Semarang, Yogyakarta, Surabaya, Bali, Medan, Makassar, atau ketik koordinat custom.")
    add_p("• Preview Widget: Tampil di Kolom 2 (di tengah), menampilkan ikon kondisi cuaca (matahari/hujan), suhu realtime, status cuaca, kelembaban, dan indeks UV.")

    # FITUR 7: AUTO BUKA APLIKASI
    add_h2("7. Auto Buka Aplikasi & Deep Linking (#5)")
    add_p("• Masalah Sebelumnya: Untuk mencari film di Netflix atau memutar lagu di YouTube/Spotify, kita harus membuka browser, mengetik alamat web, lalu mencari secara manual.")
    add_p("• Solusi yang Dibuat: Deep linking parser cerdas di chat dan modal Quick Apps Launcher.")
    add_p("• Contoh Perintah Chat:")
    add_bullet("• ", "'buka netflix cari film interstellar' ➔ Langsung meluncur ke pencarian Interstellar di Netflix.")
    add_bullet("• ", "'buka youtube lagunya coldplay' ➔ Langsung memutar pencarian Coldplay di YouTube.")
    add_bullet("• ", "'buka maps rumah sakit terdekat' ➔ Langsung membuka rute Google Maps.")
    add_bullet("• ", "'buka spotify' atau 'buka whatsapp' ➔ Langsung meluncur ke aplikasi web terkait.")
    add_p("• Tampilan Kartu Interaktif: Di kolom chat muncul kartu launcher bergaya aplikasi modern dengan tombol buka langsung.")

    # FITUR 8: ACC (AURA CONTROL CENTER)
    add_h2("8. ACC - AURA Control Center (Servo & 4 Relay ESP32) (#4)")
    add_p("• Masalah Sebelumnya: Tidak ada kontrol visual untuk mengendalikan perangkat fisik ESP32 secara leluasa dari layar web.")
    add_p("• Solusi yang Dibuat:")
    add_bullet("• Kendali Servo (Pin GPIO 18): ", "Slider putar 0° hingga 180°, penunjuk derajat digital bercahaya cyan, tombol cepat (0°, 45°, 90°, 135°, 180°), dan tombol 'Auto-Sweep Patrol' yang membuat motor servo menyapu bolak-balik otomatis seperti radar pengintai.")
    add_bullet("• Matriks 4 Saklar Relay: ", "4 kartu saklar independen untuk Lampu Utama (GPIO 25), Kipas Angin (GPIO 27, ada animasi kipas berputar saat ON), Power Socket/Stop Kontak (GPIO 5), dan Pompa Aksesori (GPIO 15). Dilengkapi tombol master 'Semua Nyala' dan 'Semua Mati'.")
    add_bullet("• Firmware ESP32: ", "Disediakan file acc_control.h di folder Arduino yang langsung membaca perintah Firebase /acc.json dengan respon kilat.")
    add_bullet("• Kendali Suara / Chat: ", "Bisa dikendalikan lewat chat, misalnya: 'servo 90', 'nyalakan lampu', 'matikan kipas', 'hidupkan semua relay'.")

    # FITUR 9: SIMPAN FOTO KE CLOUD
    add_h2("9. Simpan Foto ke Cloud & Galeri Cloud (#6)")
    add_p("• Masalah Sebelumnya: Tidak ada cara untuk menyimpan foto catatan, tangkapan kamera ESP32, atau gambar penting langsung ke sistem AURA.")
    add_p("• Solusi yang Dibuat:")
    add_bullet("• Kompresor Otomatis: ", "Saat Anda memilih foto dari HP atau laptop, sistem otomatis mengecilkan resolusi maksimal 800px dan mengonversi ke WebP/JPEG berkualitas tinggi dengan ukuran hanya 30-50 KB.")
    add_bullet("• Penyimpanan Cloud Firebase: ", "Foto disimpan langsung di cloud Firebase node /galeri.json sehingga otomatis bisa dilihat dari perangkat mana saja yang membuka AURA.")
    add_bullet("• Lightbox Layar Penuh: ", "Bisa mengklik foto untuk melihat tampilan jernih layar penuh, mendownload foto ke komputer, atau menghapus foto.")
    add_bullet("• Tombol Kamera di Chat Bar: ", "Ada tombol kamera kecil persis di sebelah kolom ketik pesan untuk unggah kilat.")

    # ========================================================
    # BAB 4: PENATAAN 3 KOLOM PREVIEW WIDGET
    # ========================================================
    add_h1("BAB 4: Penataan 3 Kolom Preview Widget di Layar")
    add_p("Kemarin Anda meminta agar widget preview disusun rapi ke bawah (vertikal) di sebelah kiri, tepat di bawah bar kapsul status 'Connected'. Berikut adalah susunan 3 kolom tersebut:")

    add_bullet("1. Kolom 1 (Paling Atas) - Notes & Goals: ", "Menampilkan cuplikan catatan terakhir dan progress bar target harian Anda. Mengklik kotak ini akan langsung membuka Notepad & Goals.")
    add_bullet("2. Kolom 2 (Tengah) - Cuaca Radar: ", "Menampilkan icon cuaca, kota (Pemalang), suhu realtime (--°C), status kondisi langit, kelembaban air, dan indeks radiasi UV. Mengklik kotak ini akan membuka radar prakiraan 24 jam.")
    add_bullet("3. Kolom 3 (Bawah) - Riwayat Chat: ", "Menampilkan jumlah obrolan tersimpan, snippet percakapan terakhir, dan timestamp. Mengklik kotak ini akan membuka arsip riwayat chat lengkap.")

    add_callout("PERBAIKAN RESPONTIF LAYAR SEMPIT", [
        "Awalnya, di kode lama ada aturan CSS yang menyembunyikan kotak-kotak ini jika jendela browser berukuran sempit (lebar < 640px).",
        "Itulah sebabnya ketika Anda mengecilkan jendela browser atau membuka di layar sempit, kotaknya sempat tidak muncul.",
        "Kini aturan tersebut sudah diperbaiki! Kotak preview tetap tampil rapi, proporsional, dan pas di bawah kapsul status pada semua ukuran layar (laptop penuh, jendela separuh layar, maupun layar HP)."
    ], border_hex="F59E0B", bg_hex="FFFBEB")

    # ========================================================
    # BAB 5: CHEAT SHEET PERINTAH SUARA & CHAT LENGKAP
    # ========================================================
    add_h1("BAB 5: Cheat Sheet Perintah Praktis Sehari-hari")
    add_p("AURA NEXT GEN dilengkapi AI Natural Language Intent Parser. Anda tidak perlu selalu mengklik tombol mouse; cukup ketik atau ucapkan perintah berikut di kolom chat:")

    # Table of commands
    tbl_cmd = doc.add_table(rows=1, cols=3)
    tbl_cmd.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cmd.autofit = False
    
    col_widths = [Inches(2.5), Inches(2.5), Inches(2.5)]
    headers = ["Kategori", "Contoh Perintah Teks / Suara", "Aksi yang Terjadi"]
    
    hdr_cells = tbl_cmd.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        set_cell_shading(hdr_cells[i], "E2E8F0")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title)
        r.bold = True
        r.font.name = 'Calibri'
        r.font.size = Pt(13)
        r.font.color.rgb = RGBColor(0, 0, 0)
    
    rows_data = [
        ("Kendali Servo", "servo 90 / servo 45 / servo tengah / servo mentok kanan", "Memutar motor servo fisik ke sudut derajat yang ditentukan via Firebase."),
        ("Auto-Sweep Servo", "sweep servo / patroli servo", "Mengaktifkan mode servo bolak-balik otomatis seperti radar."),
        ("Kendali Lampu", "nyalakan lampu / matikan lampu / hidupkan relay 1", "Mengubah status pin Relay 1 (GPIO 25) pada ESP32 secara instan."),
        ("Kendali Kipas", "nyalakan kipas / matikan kipas / hidupkan fan", "Mengubah status pin Relay 2 (GPIO 27) + animasi baling-baling berputar."),
        ("Master Relay", "nyalakan semua relay / matikan semua relay", "Mengaktifkan atau mematikan seluruh 4 saklar sekaligus (ALL ON / OFF)."),
        ("Buka Modal Panel", "buka acc / buka cuaca / buka galeri / buka catatan", "Membuka popup modal yang bersangkutan di layar tanpa perlu mencari tombol."),
        ("Pengingat Waktu", "ingatkan saya minum air 15 menit / ingatkan rapat 1 jam", "Memasang alarm hitung mundur; membunyikan nada beep saat waktu habis."),
        ("Buka Aplikasi", "buka netflix cari avatar / buka youtube coldplay", "Membuka tab baru dan langsung mencari konten di layanan terkait."),
        ("Unggah Foto", "simpan foto / unggah foto / upload gambar", "Membuka modal galeri cloud dan langsung memicu kotak pemilih file.")
    ]

    for cat, cmd, act in rows_data:
        row_cells = tbl_cmd.add_row().cells
        for i, text in enumerate([cat, cmd, act]):
            row_cells[i].width = col_widths[i]
            set_cell_shading(row_cells[i], "FAFAFA" if rows_data.index((cat, cmd, act)) % 2 == 0 else "FFFFFF")
            set_cell_margins(row_cells[i], top=80, bottom=80, left=100, right=100)
            p = row_cells[i].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(text)
            r.font.name = 'Calibri'
            r.font.size = Pt(12.5)
            r.font.color.rgb = RGBColor(0, 0, 0)
            if i == 0:
                r.bold = True

    add_p("", space_after=8)

    # ========================================================
    # BAB 6: PANDUAN MENJALANKAN & MERAWAT SISTEM
    # ========================================================
    add_h1("BAB 6: Panduan Menjalankan & Merawat Sistem")
    
    add_h2("1. Menjalankan Dashboard di Laptop")
    add_p("Cukup klik dua kali file index.html atau buka lewat browser Google Chrome / Microsoft Edge. Tidak butuh server web khusus, semuanya berjalan ringan langsung dari file.")

    add_h2("2. Menjalankan Alat ESP32 Fisik")
    add_bullet("• Program Arduino: ", "Buka folder 'Aura Folder Arduino' di Arduino IDE. Program utama adalah AURA_Last.ino yang sudah otomatis memanggil acc_control.h, firebase_client.h, sensor_dht.h, dan komponen lainnya.")
    add_bullet("• Koneksi WiFi: ", "Pastikan SSID dan Password WiFi di file secrets.h sudah sesuai dengan hotspot/WiFi rumah Anda.")
    add_bullet("• Pin Hardware: ", "Servo disambungkan ke GPIO 18, Relay 1 ke GPIO 25, Relay 2 ke GPIO 27, Relay 3 ke GPIO 5, Relay 4 ke GPIO 15.")

    add_h2("3. Keamanan & Backup")
    add_p("Sebelum kita mulai merombak hari ini, sistem sudah kita backup penuh di folder C:\\Users\\Administrator\\AuraNextGen_backup_20261116 dan file zip AuraNextGen-backup-20261116.zip. Seluruh perubahan kode juga tercatat rapi di Git repository sehingga riwayat aman 100%.")

    add_callout("KESIMPULAN AKHIR", [
        "Sekarang Anda tidak perlu bingung lagi! Proyek AURA NEXT GEN Anda kini memiliki 9 fitur komplit yang saling melengkapi:",
        "Mulai dari tampilan visual glitch yang menawan, multi-API key yang anti-mogok, catatan target harian, alarm pengingat, arsip percakapan, prakiraan cuaca radar 24 jam, peluncur aplikasi instan, pusat kontrol hardware servo & relay (ACC), hingga album foto cloud mandiri.",
        "Simpan dan baca dokumen ini kapan saja Anda ingin mengingat atau mempelajari alur sistem ini kembali. Selamat menikmati AURA NEXT GEN!"
    ], border_hex="10B981", bg_hex="F0FDF4")

    output_path = r"c:\Users\Administrator\AuraNextGen\Panduan_Lengkap_AURA_NEXT_GEN.docx"
    doc.save(output_path)
    print(f"File dokumen Word berhasil dibuat di: {output_path}")

if __name__ == '__main__':
    create_aura_guide()
