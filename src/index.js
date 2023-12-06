// require('dotenv').config();
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import express from "express";
const app = express();
dotenv.config({ path: "./env" });


const port = process.env.PORT || 8000;


connectDB().then( () => {
   app.on("error", (err) => {
      console.log("Error: " + err);
      throw err;
    });

    app.listen(port, () => {
      console.log("Server is listening on port " + port);
    });
  }).catch((err) => {
    console.log("MongoDB Connection Failed", err);
  });




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
