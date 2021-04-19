const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/employeeRegistration",{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log(`Connection is Sucessful`)
).catch((e)=>console.log(`Connection is not sucessful`))