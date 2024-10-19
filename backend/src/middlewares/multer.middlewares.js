import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    /* re write the code for for change the file original file name to somitng else ex:-
    gautam.pdf -> a023n**&#_ajfk.pdf 
    */
   cb(null, file.originalname);
    }
})
  
export const upload = multer({
    storage: storage,
})