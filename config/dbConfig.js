import mongoose from 'mongoose'
function dbConnect(){
    console.log("database connecting...")
    mongoose.connect(process.env.MONGO_URI).then(result=>{
        console.log("Database connected")
    }).catch((err)=>{
        console.log("data base error \n"+err)
    })
}
export default dbConnect