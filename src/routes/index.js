import Router from 'express'
// import socialAuthRoutes from './socialAuthRoutes'
import authRoutes from './authRoutes'
import propertiesRoutes from './propertiesRoutes'
import searchRoute from './searchRoute'
import blogRoutes from './blogRoutes'
import commentRoutes from './commentRoutes'
import placeRoutes from './placeRoutes'
import rateRoutes from './rateRoutes'
import categoriesRoutes from './categoriesRoutes'

const router = Router()

// router.use(socialAuthRoutes)
router.use(authRoutes)
router.use(propertiesRoutes)
router.use(searchRoute)
router.use(blogRoutes)
// router.use(commentRoutes)
router.use(placeRoutes)
router.use(rateRoutes)
router.use(categoriesRoutes)

export default router
