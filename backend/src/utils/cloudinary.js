import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload file on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Check if the file path is valid
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("File path is invalid or the file does not exist:", localFilePath);
            return null;
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log(`File uploaded on Cloudinary: \n URL: ${response.url} \n Format: ${response.format}`);
        return response;

    } catch (error) {
        // Log the error for debugging
        console.error("Error uploading to Cloudinary:", error);

        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Temporary file ${localFilePath} has been removed`);
        }

        return null;
    }
};

const deleteFileFromCloudinary = async (oldFileUrl) => {
    try {
        if (!oldFileUrl) {
            console.error("Old file does not exist:", oldFileUrl);
            return null;
        }

        // Extract public ID from Cloudinary URL (assuming URLs are structured as /image/upload/vXXX/{public_id}.{format})
        const publicId = oldFileUrl.split('/').slice(-1)[0].split('.')[0]; // Extract the public ID part from URL

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto" // This auto-detects if it's an image or video
        });

        console.log(`Cloudinary response: ${response.result}`);
        return response;

    } catch (error) {
        console.error("Error while deleting file from Cloudinary:", error);
        return null;
    }
};


export { 
    uploadOnCloudinary,
    deleteFileFromCloudinary 
};


/*

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();

*/