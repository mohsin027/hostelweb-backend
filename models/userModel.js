import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";


const userSchema=mongoose.Schema({
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
    // required:true
},
gender:{
  type:String,
  // required:true
},
contactNumber:{
  type:String,
},
address:{
  type:String,
},
isBlocked: {
  type: Boolean,
  default: false,
},
// hostelData: [{
//   type: Object
// }],
image: {
  type: Object
}

},
{ timestamps: true }
)

const UserModel=mongoose.model('user',userSchema)
export default UserModel;