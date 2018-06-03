const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

blogSchema.statics.format = (blog) => {
    return {
        id: blog._id,
        title: blog.title,
        author: blog.author,
        adult: blog.adult,
        user: blog.user
    }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog