const multer = require('multer');
const path = require('path');

class Upload {
    constructor(destination = 'uploads/'){
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            },
        });
    }

    getUploader(){
        return multer({storage: this.storage});
    }
}

module.exports = Upload;