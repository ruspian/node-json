const fs = require('fs');

// membuat folder data jika belum ada 
const folderData = './data';
if( !fs.existsSync(folderData)) {
    fs.mkdirSync(folderData);
};

// membuat file kontaks jika belum ada
const fileKontaks = './data/contacts.json';
if( !fs.existsSync(fileKontaks)) {
    fs.writeFileSync(fileKontaks, '[]', 'utf-8');
};


// fungsi mengambil dan membaca data JSON
const loadKontak = () => {
    const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8');
    const contacts = JSON.parse(fileBuffer); 
    return contacts;
};

// fungsi cari kontak dalam json
const findContact = (nama) => {
    const contacts = loadKontak();
    const contact = contacts.find((contact) => contact.nama === nama);
    return contact;
};


// fungsi menimpa file semua data kontak json dengan yang baru
const simpanKontak = (contacts) => {
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
};


// fungsi menambahkan kontak baru
const tambahKontak = (contact) => {
    const contacts = loadKontak();
    contacts.push(contact);
    simpanKontak(contacts);
};


// cek nama yang duplikat
const cekDuplikat = (nama) => {
    const contacts = loadKontak();
    return contacts.find((contact) => contact.nama === nama);
};

// hapus kontak 
const hapusKontak = (nama) => {
    const contacts = loadKontak();
    const filterKontak = contacts.filter((contact) => contact.nama !== nama);
    simpanKontak(filterKontak);

};

// fungsi update kontak
const updateKontak = (kontakBaru) => {
    const contacts = loadKontak();

    // hilangkan kontak nama yang namanya sama dengan nama lama
    const filterKontak = contacts.filter((contact) => contact.nama !== kontakBaru.namaLama);
    delete kontakBaru.namaLama; // hapus nama lama kontak
    filterKontak.push(kontakBaru); // tambah kontak baru 
    simpanKontak(filterKontak); // timpa kontak lama dengan kontak baru
};

module.exports = { loadKontak, findContact, tambahKontak, cekDuplikat, hapusKontak, updateKontak };