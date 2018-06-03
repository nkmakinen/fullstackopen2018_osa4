const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        author: 'Niko Mäkinen',
        title: 'My First Blog',
        url: 'http://blog.com/blog1',
        likes: 5
    },
    {
        author: 'Niko Mäkinen',
        title: 'My Second Blog',
        url: 'http://blog.com/blog2',
        likes: 1
    }
]

const format = (blog) => {
    return {
        author: blog.author,
        title: blog.title,
        url: blog.url,
        likes: blog.likes,
    }
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(format)
}

const usersInDb = async () => {
    const users = await User.find({})
    return users
}

module.exports = {
    format,
    blogsInDb,
    initialBlogs,
    usersInDb
}