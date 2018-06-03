const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let sum = blogs.reduce((total, entry) => {
        return total + entry.likes
    }, 0)

    return sum
}

const favouriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    let mostLikedBlog = {
        title: blogs[0].title,
        author: blogs[0].author,
        likes: blogs[0].likes
    }

    blogs.forEach(blog => {
        if (blog.likes > mostLikedBlog.likes) {
            mostLikedBlog.title = blog.title
            mostLikedBlog.author = blog.author
            mostLikedBlog.likes = blog.likes
        }
    })

    return mostLikedBlog
}

const mostBlogs = (blogs) => {
    let bloggers = []

    blogs.forEach(blog => {
        let result = bloggers.find(blogger => blog.author === blogger.author)
        let arrIdx = bloggers.findIndex(blogger => blog.author === blogger.author)

        if (result !== undefined) {
            let updatedResult = {
                author: result.author,
                blogs: result.blogs + 1
            }

            bloggers[arrIdx] = updatedResult
        } else {
            bloggers.push({
                "author": blog.author,
                "blogs": 1
            })
        }
    })

    let authorWithMostBlogs = {
        author: null,
        blogs: null    
    }
    

    let highestBlogCount = 0
    bloggers.forEach(blogger => {
        if (blogger.blogs > highestBlogCount) {
            authorWithMostBlogs.author = blogger.author
            authorWithMostBlogs.blogs = blogger.blogs
        }
    })

    return authorWithMostBlogs
}

const mostLikes = (blogs) => {
    let bloggers = []

    blogs.forEach(blog => {
        let result = bloggers.find(blogger => blog.author === blogger.author)
        let arrIdx = bloggers.findIndex(blogger => blog.author === blogger.author)

        if (result !== undefined) {
            let updatedResult = {
                author: result.author,
                likes: result.likes + blog.likes
            }

            bloggers[arrIdx] = updatedResult
        } else {
            bloggers.push({
                author: blog.author,
                likes: blog.likes
            })
        }
    })

    let authorWithMostLikes = {
        author: null,
        likes: null    
    }

    let highestLikes = 0
    bloggers.forEach(blogger => {
        if (blogger.likes > highestLikes) {
            highestLikes = blogger.likes
            authorWithMostLikes.author = blogger.author
            authorWithMostLikes.likes = blogger.likes
        }
    })

    return authorWithMostLikes
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}