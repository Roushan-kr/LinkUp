import ImageKit from "imagekit";

// Only initialize ImageKit if environment variables are provided
let imagekit = null;

if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
} else {
    console.log("ImageKit not configured - using placeholder values");
    // Create a mock object for development
    imagekit = {
        upload: () => Promise.reject(new Error("ImageKit not configured")),
        url: () => "https://via.placeholder.com/300"
    };
}

export default imagekit;