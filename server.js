const app = require("./app");

const dotenv= require("dotenv");

dotenv.config({path:"./config.env"});
const connectDatabase = require("./config/database");

//Handling Uncaught Execption

process.on('uncaughtException', (err)=>{

      console.log(`Error :${err.message}`);
      console.log(`Shutting down the server due to Uncaught Exception Error`);

      process.exit(1);
})

//Config 

dotenv.config({path:"backend/config/config.env"});

//connect data base

connectDatabase();



const server=app.listen(process.env.PORT, () =>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`); 
}) 

//unhandled Promise Rejection

process.on('unhandledRejection', (err)=>{
    console.log(`Error :${err.message}`);
    console.log(`Shutting down the server due unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1);
    })
})