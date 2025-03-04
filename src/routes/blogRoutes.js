import Router from 'express';
import multer from 'multer'
import asyncErrorHandler from '../utils/asyncErrorHandler';
import blogController from '../controllers/blogController';
import verifyToken from '../middlewares/tokenValidation';

const router = Router();
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.get('/blogs', asyncErrorHandler(blogController.getAllBlogs))
router.get('/blog/:id', asyncErrorHandler(blogController.getOneBlog))
router.get('/blog/slug/:slug', asyncErrorHandler(blogController.getOneBlogBySlug))
router.post('/blog', verifyToken, asyncErrorHandler(blogController.addBlog))
router.patch('/blog/:id', verifyToken, asyncErrorHandler(blogController.blogUpdate))
router.delete('/blog/:id', verifyToken, asyncErrorHandler(blogController.deleteBlog))
router.post('/blog/img/:id', verifyToken, upload.array('avatar'), asyncErrorHandler(blogController.addImg))
router.post('/blog/search', asyncErrorHandler(blogController.search))

export default router
