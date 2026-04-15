const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary — called lazily to ensure env vars are loaded
const getCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your server .env file.'
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary;
};

/**
 * Uploads a file buffer to Cloudinary
 * @param {Object} file - The file object from multer (memoryStorage)
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    let cloud;
    try {
      cloud = getCloudinary();
    } catch (err) {
      return reject(err);
    }

    const uploadStream = cloud.uploader.upload_stream(
      {
        folder: 'balajee/products',
        resource_type: 'auto',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(new Error(`Cloudinary Upload Error: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

module.exports = { uploadImage };
