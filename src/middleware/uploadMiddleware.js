// middleware/uploadMiddleware.js
import { formidable } from 'formidable';
import admin from '@/firebase/firebaseAdmin'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid';

console.log('[Middleware] uploadMiddleware.js loaded.');

export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parsing
    },
};

const storageAdmin = admin.storage();
const bucket = storageAdmin.bucket();
console.log('[Middleware] Firebase Admin Storage initialized. Bucket:', bucket.name);

export const parseFormWithImage = async (req, imageFieldName = 'image') => {
    console.log(`[Middleware] parseFormWithImage called. imageFieldName: "${imageFieldName}"`);
    return new Promise(async (resolve, reject) => {
        const form = formidable({});
        console.log('[Middleware] Formidable instance created.');

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('[Middleware] ERROR - formidable form.parse:', err);
                return reject({ status: 500, message: 'Error parsing form data.', detail: err.message, errorObject: err });
            }
            console.log('[Middleware] Formidable form.parse successful. Raw Fields:', JSON.stringify(fields, null, 2));
            console.log('[Middleware] Formidable form.parse successful. Raw Files:', JSON.stringify(files, null, 2));

            const parsedFields = {};
            for (const key in fields) {
                if (fields[key] && fields[key].length === 1) {
                    parsedFields[key] = fields[key][0];
                } else {
                    parsedFields[key] = fields[key];
                }
            }
            console.log('[Middleware] Parsed (single value) Fields:', JSON.stringify(parsedFields, null, 2));


            if (files[imageFieldName] && files[imageFieldName][0]) {
                const imageFile = files[imageFieldName][0];
                console.log('[Middleware] Image file found in files object. Original Filename:', imageFile.originalFilename, 'Size:', imageFile.size, 'Type:', imageFile.mimetype);

                if (imageFile.size === 0) {
                    console.log('[Middleware] Image file size is 0, treating as no image uploaded.');
                    resolve({ fields: parsedFields, imageUrl: null });
                    return;
                }

                const uniqueFilename = `aadhar_photos/${uuidv4()}-${imageFile.originalFilename}`;
                const filePath = imageFile.filepath;
                console.log(`[Middleware] Attempting to upload image. Unique Filename: "${uniqueFilename}", Temp File Path: "${filePath}"`);

                try {
                    const [file] = await bucket.upload(filePath, {
                        destination: uniqueFilename,
                        metadata: {
                            contentType: imageFile.mimetype,
                        },
                    });
                    console.log('[Middleware] Image uploaded to Firebase Storage. File details received:', file.name);

                    await file.makePublic(); // Or use getSignedUrl
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                    console.log('[Middleware] Image made public. URL:', publicUrl);

                    resolve({ fields: parsedFields, imageUrl: publicUrl });
                } catch (uploadError) {
                    console.error('[Middleware] ERROR - Firebase Storage upload:', uploadError);
                    reject({ status: 500, message: 'Failed to upload Aadhar photo.', detail: uploadError.message, errorObject: uploadError });
                }
            } else {
                console.log('[Middleware] No image file found under field name or file array is empty:', imageFieldName);
                resolve({ fields: parsedFields, imageUrl: null });
            }
        });
    });
};