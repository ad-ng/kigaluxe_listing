import Router from 'express';
import multer from 'multer'
import asyncErrorHandler from '../utils/asyncErrorHandler';
import verifyToken from '../middlewares/tokenValidation';
import placeController from '../controllers/placeController';

const router = Router();
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.get('/place', asyncErrorHandler(placeController.getAllPlace))
router.get('/place/:id', asyncErrorHandler(placeController.getOnePlace))
router.get('/place/slug/:slug', asyncErrorHandler(placeController.getOnePlaceBySlug))
router.post('/place', verifyToken, asyncErrorHandler(placeController.createPlace))
router.post('/place/img/:id', verifyToken, upload.array('avatar'), asyncErrorHandler(placeController.addPlaceImg))
router.patch('/place/:id', verifyToken, asyncErrorHandler(placeController.updatePlace))
router.delete('/place/:id', verifyToken, asyncErrorHandler(placeController.deleteAPlace))
router.get('/places/similar', asyncErrorHandler(placeController.similar))
router.post('/place/search', asyncErrorHandler(placeController.search))

export default router
