const mongoose = require('mongoose') 


const blogCategorySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
}, 
{
    timestamps: true
}
);


module.exports = mongoose.model('Blogcategory', blogCategorySchema);