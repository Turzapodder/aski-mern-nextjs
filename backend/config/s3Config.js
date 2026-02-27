import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const blockedExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".msi",
    ".com",
    ".scr",
    ".ps1",
    ".vbs",
    ".jar"
];

const blockedMimeTypes = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-dosexec",
    "application/x-sh",
    "application/x-bat",
    "application/x-cmd",
    "application/x-msi",
    "application/x-executable"
];

const assignmentFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (blockedExtensions.includes(ext)) {
        return cb(new Error("Invalid file type"), false);
    }
    if (blockedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
};

// const fileFilter = (req, file, cb) => {
//     const allowedMimes = [
//         'image/jpeg',
//         'image/png',
//         'image/gif',
//         'image/webp',
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'text/plain',
//         'video/mp4',
//         'video/avi',
//         'video/mov',
//         'video/wmv'
//     ];

//     if (allowedMimes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Invalid file type'), false);
//     }
// };

export const uploadProfile = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `profiles/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const uploadAssignment = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `assignments/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    }),
    fileFilter: assignmentFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
