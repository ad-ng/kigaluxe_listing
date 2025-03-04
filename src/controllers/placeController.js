/* eslint-disable require-jsdoc */
import crypto from 'crypto'
import placeDB from '../utils/db/placeBD'
import paginator from '../utils/paginator'
import s3_helper from '../utils/s3_helper'

class placeController {
  /*
***********************************************************************************************************
------------------------------- getAllPlace controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getAllPlace(req, res) {
    // initializing the variables
    const page = req.query.page || 1
    const limit = req.query.limit || 10

    const allPlaces = await placeDB.getAllPlace()
    const urls = await Promise.all(allPlaces.map((place) => s3_helper.newLevelUrl(place.img)))
    const updated = allPlaces.map((element, index) => {
      const holder = element.toJSON()
      holder.url = urls[index]
      return holder
    })

    res.json({
      status: 200,
      data: paginator(updated, page, limit)
    })
  }

  /*
***********************************************************************************************************
------------------------------- createPlace controller ---------------------------------------------------
***********************************************************************************************************
*/

  static async createPlace(req, res) {
    const { province, district, sector, knownName, description } = req.body
    const entry = { province, district, sector, knownName, description }

    const placeExist = await placeDB.checkExist(province, district, sector, knownName)

    if (placeExist) {
      return res.status(400).json({
        status: 400,
        error: 'place not saved, already exist'
      })
    }

    const isSaved = await placeDB.addPlace(entry)
    if (isSaved) {
      return res.json({
        status: 200,
        message: 'place created successfully'
      })
    }
  }

  /*
***********************************************************************************************************
---------------------------------- updatePlace controller -----------------------------------------------
***********************************************************************************************************
*/

  static async updatePlace(req, res) {
    // initialising variables we need
    const id = req.params.id
    const { province, district, sector, knownName, description } = req.body
    const entry = { province, district, sector, knownName, description }

    // handling emptyness scenarios
    if (!await placeDB.findPlaceById(id)) {
      return res.status(404).json({
        status: 404,
        error: `no place with id:${id} found`
      })
    }

    try {
      await placeDB.updatePlace(id, entry)
      res.json({
        status: 200,
        message: `place with id ${id} updated successfully`
      })
    } catch (error) {
      res.status(500).json({
        status: 500,
        error
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- deletePlace controller ---------------------------------------------------
***********************************************************************************************************
*/

  static async deleteAPlace(req, res) {
    const { id } = req.params
    if (!await placeDB.findPlaceById(id)) {
      return res.status(404).json({
        status: 404,
        error: `no place with id:${id} found`
      })
    }
    const place = await placeDB.findPlaceById(id)
    if (place.img) await s3_helper.deleteObject(place.img)
    const isDeleted = await placeDB.deletePlace(id)
    if (isDeleted) {
      res.json({
        status: 200,
        message: `the place with id:${id} is deleted successfully`
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- addPlaceImg controller ---------------------------------------------------
***********************************************************************************************************
*/

  static async addPlaceImg(req, res) {
    const id = req.params.id
    const files = req.files[0]

    if (!await placeDB.findPlaceById(id)) {
      return res.status(404).json({
        status: 404,
        error: `no place with id:${id} found`
      })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "No files were uploaded"
      });
    }
    const randomImageName = (bytes = 12) => crypto.randomBytes(bytes).toString('hex');
    const place = await placeDB.findPlaceById(id)

    if (place.img) {
      await await s3_helper.deleteObject(place.img)
    }

    const key = `place/${randomImageName()}`

    try {
      await s3_helper.s3_objPut(key, files.buffer, files.mimetype)
      await placeDB.updatePlace(id, { img: key })
      res.json({
        status: 200,
        message: 'image added successfully'
      })
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'failure',
        error
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- getOnePlace controller ---------------------------------------------------
***********************************************************************************************************
*/

  static async getOnePlace(req, res) {
    let place = await placeDB.findPlaceById(req.params.id)
    place = place.toJSON()
    place.url = await s3_helper.newLevelUrl(place.img)
    res.json({
      status: 200,
      message: 'request was successful',
      place
    })
  }

  static async getOnePlaceBySlug(req, res) {
    let place = await placeDB.findPlaceBySlug(req.params.slug)
    if (!place) {
      return res.status(404).json({
        status: 404,
        error: 'no place found with that slug'
      })
    }
    place = place.toJSON()
    place.url = await s3_helper.newLevelUrl(place.img)
    res.json({
      status: 200,
      message: 'request was successful',
      place
    })
  }

  static async similar(req, res) {
    const { location } = req.query
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    if (!location) {
      return res.status(400).json({
        status: 400,
        error: 'location can\'t be empty'
      })
    }
    const place = await placeDB.searchThrough(location)
    if (place.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'no similar place found'
      })
    }

    const similar = await placeDB.similarSearch(place[0].district)

    res.status(200).json({
      status: 200,
      message: "similar places found",
      data: paginator(similar, page, limit)
    })
  }

  static async search(req, res) {
    const { location } = req.query
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    if (!location) {
      return res.status(400).json({
        status: 400,
        error: 'location can\'t be empty'
      })
    }
    const place = await placeDB.searchThrough(location)
    if (place.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'no similar place found'
      })
    }

    res.status(200).json({
      status: 200,
      message: "similar places found",
      data: paginator(place, page, limit)
    })
  }
}

export default placeController
