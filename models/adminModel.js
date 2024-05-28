import mongoose from "mongoose";


const schema=mongoose.Schema({
fullName: {
  type: String,
  required:true
},
email:{
    type: String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true
}
},
{ timestamps: true }
)

const AdminModel=mongoose.model('admin',schema)
export default AdminModel;