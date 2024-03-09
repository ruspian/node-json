const express = require('express');  // reques modul express
const expressLayouts = require('express-ejs-layouts');  // reques modul express layout
const { body, validationResult, check } = require('express-validator');
const { loadKontak, findContact, tambahKontak, cekDuplikat, hapusKontak, updateKontak } = require('./utils/contacts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
// const morgan = require('morgan');

// menentukan variable express
const app = express();
const port = 3000;

// menggunakan ejs
app.set('view engine', 'ejs');
// mengunakan express layout
// thith party midleware
app.use(expressLayouts);
app.use(express.urlencoded({extended : true}));  // build in midleware

// express.static => mengizinkan folder ditampilkan
// build-in midleware
app.use(express.static('public'));


// konfigurasi flash/menampilkan pesan berhasil
app.use(cookieParser('secret'));
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true,
}));
app.use(flash());


// memanggil index
app.get('/', (req, res) => {
    //   res.send('Hello World!');
    // res.json({
        //     nama : 'Ruspian Majid',
        //     email : 'ruspianntb@gmail.com',
        //     noHP : '082293308893',
        // });

        // res.sendFile('./index.html', { root : __dirname });

        // memanggil index menggunakan ejs
        const mahasiswa = [
            {
                nama : 'Ruspian Majid',
                email : 'ruspian@gmail.com'
            },
            {
                nama : 'Suhirman',
                email : 'suhir@gmail.com'
            },
            {
                nama : 'Muhammad Farhat',
                email : 'farhat@gmail.com'
            },
        ]
        res.render('index', { 
            nama : 'Ruspian Majid', 
            title : 'Halaman Utama',
            layout : 'layouts/main-layout',
            mahasiswa,
        });
    });
    
// memanggil about
app.get('/about', (req, res) => {
    // res.sendFile('./about.html', { root : __dirname });
    res.render('about', { 
        title : 'Halaman Tentang',
        layout : 'layouts/main-layout'
    });
});

// memanggil contact
app.get('/contact', (req, res) => {
    // res.sendFile('./contact.html', { root : __dirname });
    const kontaks = loadKontak();
    res.render('contact', { 
        title : 'Halaman Kontak',
        layout : 'layouts/main-layout',
        kontaks,
        msg : req.flash('msg')
    });
});

// klik dan masuk halaman tambah kontak
app.get('/contact/add', (req, res) => {
    res.render('addKontak', { 
        title : 'Halaman Tambah Kontak',
        layout : 'layouts/main-layout',
    });
});

// proses input data via form 
app.post('/contact',[
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value);
        if(duplikat) {
            throw new error('Nama sudah digunakan!');
        }
    return true;
    }),
    check('email', 'Email Tidak Valid!').isEmail(), // validasi cek email
    check('noHP', 'Nomor HP Tidak Valid!').isMobilePhone('id-ID')   // validasi cek nomor hp
], (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        // return res.status(400).json({ error : error.array() })
        res.render('addKontak', {
            title : 'Halaman Tambah Kontak',
            layout : 'layouts/main-layout',
            errors : error.array(),
        });
    } else {
        // console.log(req.body);
        // res.send('Data berhasil dikirim!');
        tambahKontak(req.body);
        req.flash('msg', 'Kontak berhasil ditambahkan!');
        res.redirect('/contact');
    }
});

// proses delete kontak
app.get('/contact/delete/:nama',(req, res) => {
    const contact = findContact(req.params.nama);

    // jika kontak tidak ada
    if(!contact) {
        res.status(404);
        res.send('<h1>404</h1>');
    }else {
        hapusKontak(req.params.nama);
        req.flash('msg', 'Kontak berhasil dihapus!');
        res.redirect('/contact');
    }
});

// form ubah data kontak
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    res.render('editKontak', { 
        title : 'Halaman Edit Kontak',
        layout : 'layouts/main-layout',
        contact,
    });
});

// proses ubah data 
app.post('/contact/update',[
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value);
        if(value !== req.body.namaLama && duplikat) {
            throw new error('Nama sudah digunakan!');
        }
    return true;
    }),
    check('email', 'Email Tidak Valid!').isEmail(), // validasi cek email
    check('noHP', 'Nomor HP Tidak Valid!').isMobilePhone('id-ID')   // validasi cek nomor hp
], (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        // return res.status(400).json({ error : error.array() })
        res.render('aditKontak', {
            title : 'Halaman Edit Kontak',
            layout : 'layouts/main-layout',
            errors : error.array(),
            contact : req.body,
        });
    } else {
        // console.log(req.body);
        // res.send('Data berhasil dikirim!');
        updateKontak(req.body);
        req.flash('msg', 'Kontak berhasil diubah!');
        res.redirect('/contact');
    }
});


// klik dan masuk halaman detail kontak
app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama);
    res.render('detail', { 
        title : 'Halaman Detail Kontak',
        layout : 'layouts/main-layout',
        contact,
    });
});

// memanggil product
// app.get('/product/:id', (req, res) => {
//     res.send(`Product ID : ${req.params.id}  <br> Category ID : ${req.query.category}`);
// });

// menjalankan midleware
// untuk menangani halaman yang tidak ada
app.use('/', (req, res) => {
    res.status(404);
    res.send('<h1>404 : File Not Found</h1>');
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
