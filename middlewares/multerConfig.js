const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const allowedFileTypes=
        cb(null,'./uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
})