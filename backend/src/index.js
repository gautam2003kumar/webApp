
// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js';

dotenv.config({
    path: './.env'
})

connectDB()
.then(() =>{

    app.on("error", (error)=>{
        console.log("error",error);
        throw error
    })

    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is runing at port: ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGO db connection failed !!! ", err)
})



























/*
( async () => {
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) =>{
            console.log("ERROR: ", error);
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listenig on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: " , error)
        throw error
    }
})()
*/