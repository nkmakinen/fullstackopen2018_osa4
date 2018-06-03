const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogRouter.get('/', async (req, res) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

    res.json(blogs.map(Blog.format))
})
  
blogRouter.post('/', async (req, res) => {
    try {
        const token = req.token

        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return res.status(401).json({ error: 'token missing or invalid' })
        }

        const user = await User.findById(req.body.userId)

        const blog = new Blog({
            title: req.body.title,
            author: req.body.author,
            url: req.body.url,
            adult: req.body.adult,
            user: user._id
        })

        if (blog.title === undefined || blog.url === undefined) {
            return res.status(400).json()
        }

        const savedBlog = await blog.save()

        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        res.status(201).json(Blog.format(savedBlog))
    } catch (exception) {
        if (exception.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            res.status(500).json({ error: 'something went wrong..' })
        }
    }
})

blogRouter.delete('/:id', async (req, res) => {
    try {
        const token = req.token

        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return res.status(401).json({ error: 'token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)
        const blog = await Blog.findById(req.params.id)
        
        if (blog.user.toString() === user._id.toString()) {
            blog.remove()
        }

        res.status(204).end()
    } catch (exception) {
        console.log(exception)
        res.status(400).send({ error: 'malformatted id' })
    }

})

blogRouter.put('/:id', async (req, res) => {
    try {
        const body = req.body

        const blog = {
            likes: body.likes
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })

        res.status(200).json(updatedBlog)
    } catch (exception) {
        console.log(exception)
        res.status(400).send({ error: 'malformatted id' })
    }
})

module.exports = blogRouter