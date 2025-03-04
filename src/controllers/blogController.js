import crypto from 'crypto'
import slugify from 'slugify'
import blogService from "../utils/db/blogDB"
import paginator from "../utils/paginator"
import s3_helper from "../utils/s3_helper"

/* eslint-disable require-jsdoc */
class blogController {
  /*
***********************************************************************************************************
------------------------------- getAllBlogs controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getAllBlogs(req, res) {
  // initializing the variables
    const page = parseInt(req.query.page, 10) || 1 // setting default page = 1
    const limit = parseInt(req.query.limit, 10) || 5 // setting default limit = 5

    const blogs = await blogService.findAllBlogs() // getting all blogs

    // generating url link for every featured image
    const urls = await Promise.all(blogs.map((element) => {
      element.url = s3_helper.newLevelUrl(element.featuredImg)
      return element.url
    }))

    // attaching generated featured image link to every individual blog respectively
    const nBlogs = blogs.map((element, index) => {
      element.toJSON()
      element.dataValues.url = urls[index]
      return element
    })

    const pagData = paginator(nBlogs, page, limit) // paginating the data to return

    // returning the response
    res.json({
      status: 200,
      message: "request was successful",
      data: pagData
    })
  }

  /*
***********************************************************************************************************
------------------------------- getOneBlog controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getOneBlog(req, res) {
    let blog = await blogService.findOneBlog(req.params.id) // getting one blog using id
    blog = blog.toJSON() // converting blog to json
    blog.author.profUrl = await s3_helper.newLevelUrl(blog.author.profileImg) // adding author's profile image
    blog.url = await s3_helper.newLevelUrl(blog.featuredImg) // adding blog url to individual blog

    // returning the response to the user
    res.json({
      status: 200,
      message: 'request was successful',
      blog
    })
  }

  /*
***********************************************************************************************************
------------------------------- getOneBlogBySlug controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getOneBlogBySlug(req, res) {
    let blog = await blogService.findOneBlogBySlug(req.params.slug) // getting one blog using id
    if (!blog) {
      return res.status(404).json({
        status: 404,
        error: 'no blog found with that slug'
      })
    }
    blog = blog.toJSON() // converting blog to json
    blog.author.profUrl = await s3_helper.newLevelUrl(blog.author.profileImg) // adding author's profile image
    blog.url = await s3_helper.newLevelUrl(blog.featuredImg) // adding blog url to individual blog

    // returning the response to the user
    res.json({
      status: 200,
      message: 'request was successful',
      blog
    })
  }

  /*
***********************************************************************************************************
------------------------------- addBlog controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async addBlog(req, res) {
    // initializing the variables
    const authorId = req.user.id // getting authorId from jwt token
    const { title, content, categoryId } = req.body

    // making sure we get a title to avoid null errors
    if (!title) {
      return res.status(403).json({
        status: 403,
        error: 'title can\'t be empty'
      })
    }

    // making sure we don't accept null content
    if (!content) {
      return res.status(403).json({
        status: 403,
        error: 'content can\'t be empty'
      })
    }

    // making sure we get categoryId
    if (!categoryId) {
      return res.status(403).json({
        status: 403,
        error: 'categoryId can\'t be empty'
      })
    }

    const slug = slugify(`${req.body.title}`, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: false, // convert to lower case, defaults to `false`
      strict: false, // strip special characters except replacement, defaults to `false`
      locale: 'vi', // language code of the locale to use
      trim: true // trim leading and trailing replacement chars, defaults to `true`
    })

    try {
      // attempting to save a new blog
      await blogService.createBlog({ title, content, categoryId, authorId, slug })
      res.json({
        status: 200,
        message: 'blog added successfully'
      })
    } catch (error) {
      // returning an error in case we encounter one
      res.status(500).json({
        status: 500,
        error: error.message
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- blogUpdate controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async blogUpdate(req, res) {
    // initializing the variables used in this function
    const id = req.params.id // get id of blog to update from parameter
    const authorId = req.user.id // getting authorId from jwt token
    // getting the user input
    const { title, content, categoryId } = req.body

    /*
    checking if the bog we want to update exist
    */
    if (!await blogService.findOneBlog(id)) {
      return res.status(404).json({
        status: 404,
        error: 'no blog with that id found'
      })
    }
    const slug = slugify(`${req.body.title}`, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: false, // convert to lower case, defaults to `false`
      strict: false, // strip special characters except replacement, defaults to `false`
      locale: 'vi', // language code of the locale to use
      trim: true // trim leading and trailing replacement chars, defaults to `true`
    })
    const entry = { title, content, categoryId, authorId, slug }

    try {
      const blog = await blogService.updateBlog(id, entry) // updating blog

      // in case the update has not succeeded
      if (!blog[0]) {
        return res.status(403).json({
          status: 403,
          error: `blog with id:${id} not updated`
        })
      }

      // response in case updated succeeded
      res.status(201).json({
        status: 201,
        message: `the blog with id:${id} has been updated successfully`
      })
    } catch (error) {
      // in case of error
      res.status(500).json({
        status: 500,
        error: error.message
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- deleteBlog controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async deleteBlog(req, res) {
    const id = req.params.id // getting id from request parameter

    const checkBlog = await blogService.findOneBlog(id)
    /*
        checking if the blog we want to delete exist
    */
    if (!checkBlog) {
      return res.status(404).json({
        status: 404,
        error: 'no blog with that id found'
      })
    }

    // in case a blog exist
    try {
      /*
              before deleting we have to check if the blog we
                want to delete has a featuredImg and we delete it
              from S3 bucket before deleting the actual blog in db
      */
      if (checkBlog.featuredImg) {
        await s3_helper.deleteObject(checkBlog.featuredImg)
      }

      await blogService.deleteB(id) // delete a blog

      // in case a blog has been successfully deleted
      res.json({
        status: 200,
        message: `blog with id:${id} deleted successfully`
      })
    } catch (error) {
      // in case of error
      res.status(500).json({
        status: 500,
        error: error.message
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- addImg controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async addImg(req, res) {
    const id = req.params.id // getting id from the request parameter
    const file = req.files[0] // reading image from user in form of buffers

    // finding that blog in db
    const blog = await blogService.findOneBlog(id)

    /*
    we avoid to use the actual image's name to avoid having
    many files in storage with same name as it can result into errors
    so we generate a random name to ensure uniqueness
    */
    const randomImageName = (bytes = 12) => crypto.randomBytes(bytes).toString('hex');

    // in case the blog with id specified not exist
    if (!blog) {
      return res.status(404).json({
        status: 404,
        error: `no place with id:${id} found`
      })
    }

    // we have to ensure that an image has been given to avoid nulls resulting to error
    if (!file || file.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "No files were uploaded"
      });
    }

    /*
    since this controller can be used in both cases
    (creating and updating) we have to ensure that if we are
    updating, we delete the current image so that we get a space
    for new image
    */
    if (blog.featuredImg) {
      await s3_helper.deleteObject(blog.featuredImg) // deleting current image
    }

    /*
    making our custom name for an image entered
    and add it in a folder named blog in S3 bucket
    */
    const key = `blog/${id}-${randomImageName()}`

    /*
    now after ensuring that the blog exist
    and making sure we deleted its current image if exist
    we are going to add new image both in actual db and S3 bucket
    */
    try {
      // uploading image to S3 bucket
      await s3_helper.s3_objPut(key, file.buffer, file.mimetype)

      // uploading image to the db
      await blogService.updateBlog(id, { featuredImg: key })

      // returning response to the user in case of success
      res.json({
        status: 200,
        message: 'img added successfully'
      })
    } catch (error) {
      // letting user know if he encountered error
      res.status(500).json({
        status: 500,
        error: error.message
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- blogSearch controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async search(req, res) {
    const { entry } = req.query // getting something to search from user
    const page = req.query.page || 1 // setting page to be 1 by default
    const limit = req.query.limit || 5 // setting limit to be 5 by default

    // in case we received nothing to search
    if (!entry) {
      return res.status(403).json({
        status: 403,
        error: 'search can\'t be empty'
      })
    }

    // attempting to search given entry
    let newBlogs = await blogService.finder(entry)
    newBlogs = await Promise.all(newBlogs.map((blog) => {
      blog.toJSON()
      blog.dataValues.url = `https://d3mpuupcc30lzt.cloudfront.net/${blog.featuredImg}`
      return blog
    }))

    // in case we don't find any matching data
    if (newBlogs.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'nothing found !'
      })
    }

    res.status(200).json({
      status: 200,
      message: 'successful search',
      data: paginator(newBlogs, page, limit)
    })
  }
}

export default blogController
