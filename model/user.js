const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {type : String, required : true, unique : true},
    userDisplayName: {type : String},
    email: {type : String, required : true, unique : true},
    password: {type : String, required : true},
    role: {type : String, enum: ['user', 'admin'],default:'user'},
    birthday: {type : Date, default: '1990-05-15'},
    gender: {type : String, enum: ['male', 'female', 'other'],default:'other'},
    location: {type : String, default: 'ĐÀ NẴNG-VIỆT NAM'},
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (!this.userDisplayName){
        this.userDisplayName = this.username;
    }
    next();
})

userSchema.methods.isValidPassword = async function(password) {
    return bcrypt.compare(password, this.password); // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
  };
const User = mongoose.model('User', userSchema);
module.exports = User;