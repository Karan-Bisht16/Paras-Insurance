import multer from "multer";
import { v4 as uuidv4 } from "uuid";
// importing helper functions
import { getExtension } from "../utils/helperFunctions.js";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads")
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "-" + uuidv4() + getExtension(file))
    }
});

const upload = multer({ storage });
export default upload;