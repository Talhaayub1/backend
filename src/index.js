// require('dotenv').config();
import dotenv from 'dotenv';
import connectDB from './db/connect.js';

dotenv.config({path: './env'})




connectDB();








// import express from "express";
// const app = express();


// ( async () => {
//      try {
//         await mongoose.connect(`${process.env.MONGO_URI}/ ${DB_NAME}`);
//         app.on('error', (error)=>{
//           console.log(" Error while connecting");
//           throw error
//         })


//         app.listen(process.env.PORT, ()=>{
//           console.log("App listening on port " + `${process.env.PORT}`);
//         })
//      } catch (error) {
//           console.log("Database Error: " + error);
//      }
// })();
// 