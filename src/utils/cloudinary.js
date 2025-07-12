//hm yha kya krnge, first local server se file leni hai usse cloudinary pe upload krna hai then agr successful upload hogay to file ko local server se delete krna hai 
//thoda site pe documentation hai iski 

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
//fs is our file system -- comes with node js -- use for file handling 
//there are several methods read docs 
//one is unlink -- what the os does is it takes the track of files via linking to it and unlinking it when we delete a file it stays there just the link is gone -- so we use here unlink once our file is successfully uploaded to the cloudinary 
//add clodinary cloud name, api key, api secret to env file 


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        //or you can give the error such as file not found 
        if(!localFilePath) return null

        //upload the file -- there are multiple upload options go and study on website docs 
        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          folder: "my_app_uploads",
        });

        //if successfull upload then unlink the file -- try to print response so you can get idea of things are in it
        // console.log("file uploaded successfully ", response.url)
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload fails 
        return null
    }
}

export {uploadOnCloudinary}



