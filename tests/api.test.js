const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { format, initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
})

test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
        expect(returnedTitles).toContain(blog.title)
    })
})

test('POST /api/blogs succeeds with valid data', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
        title: 'Testi Testaajan blogi',
        author: 'Testi Testaaja',
        url: '',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()

    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

    const titles = blogsAfterOperation.map(b => b.title)
    expect(titles).toContain('Testi Testaajan blogi')
})

test('creating a blog without likes should default to zero likes', async () => {
    const newBlogWithoutLikes = {
        title: 'Please do not give me likes',
        author: 'Oiko Laseda',
        url: '-'
    }

    const blogsAtStart = await blogsInDb()

    await api
        .post('/api/blogs')
        .send(newBlogWithoutLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    const result = blogsAfterOperation.find(blog => blog.title === 'Please do not give me likes')

    expect(result.likes).toBe(0)
})

test('inserting a blog without title and url fails', async () => {
    const newBlogWithoutTitleAndUrl = {
        author: 'John Doe'
    }

    const blogsAtStart = await blogsInDb()

    await api
        .post('/api/blogs')
        .send(newBlogWithoutTitleAndUrl)
        .expect(400)

    const blogsAfterOperation = await blogsInDb()
    const titles = blogsAfterOperation.map(b => b.title)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
})

test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    let addedBlog = new Blog({
        author: 'Random Kirjoittelija',
        title: 'Ala-arvoinen Blogi',
        url: 'http://example.com/blog',
        likes: -10
    })

    await addedBlog.save()

    const blogsAtStart = await blogsInDb()

    await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

    const blogsAfterOperation = await blogsInDb()
    const titles = blogsAfterOperation.map(b => b.title)

    expect(titles).not.toContain(addedBlog.title)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
})

test('PUT /api/blogs/:id succeeds and returns updated blog', async() => {
    let newBlog = new Blog({
        author: 'some author',
        title: 'some title',
        url: 'some url',
        likes: 0
    })

    await newBlog.save()

    const blogsAtStart = await blogsInDb()
    
    let updatedBlog = new Blog({
        author: newBlog.author,
        title: newBlog.title,
        url: newBlog.url,
        likes: 64
    })

    await api
        .put(`/api/blogs/${newBlog._id}`)
        .send(updatedBlog)
        .expect(200)

    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = response.body
    const result = blogsAfterOperation.find(b => b._id == newBlog._id)

    expect(result.likes).toBe(updatedBlog.likes)
    expect(blogsAtStart.length).toBe(blogsAfterOperation.length)
})

describe('when there is initially one user at db', async () => {
    beforeAll(async () => {
        await User.remove({})
        const user = new User({ username: 'root', password: 'sekret' })
        await user.save()
    })

    test('POST /api/users succeeds with a fresh username', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
        const usernames = usersAfterOperation.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('POST /api/users fails with proper statuscode and message if username is already taken', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'given username is already taken' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })
})

afterAll(() => {
    server.close()
})