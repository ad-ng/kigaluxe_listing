/* eslint-disable require-jsdoc */
import crypto from 'crypto'
import slugify from 'slugify'
import propertiesDB from "../utils/db/propertiesDB"
import s3_helper from "../utils/s3_helper"
import paginator from '../utils/paginator'
import placeDB from '../utils/db/placeBD'

class propertiesController {
/*
***********************************************************************************************************
------------------------------- getProperties controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getProperties(req, res) {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const nproperty = await propertiesDB.getAllProperties()

    // Generate all image URLs concurrently
    const urls = await Promise.all(
      nproperty.map(async (prop) => {
        const shortUrls = await Promise.all(
          prop.imageIds.map((imageId) => s3_helper.newLevelUrl(imageId))
        );
        return shortUrls;
      })
    );
    const rates = nproperty.map((prop) => prop.dataValues.rates);

    // Construct property data with generated URLs
    const property_data = nproperty.map((prop, index) => {
      prop.toJSON()
      prop.dataValues.url = urls[index]
      return prop
    });
    try {
      const paginated = paginator(property_data, page, limit)
      return res.json({
        status: 200,
        message: "request received",
        data: paginated
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "An error occurred",
        error: error.message
      });
    }
  }

  /*
***********************************************************************************************************
------------------------------- getOneProperty controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getOneProperty(req, res) {
    try {
      const prop = await propertiesDB.findProperty('id', req.params.id);

      if (!prop || prop.length === 0) {
        return res.status(404).json({
          status: 404,
          error: "Property not found"
        });
      }

      const shortUrls = await Promise.all(
        prop[0].imageIds.map((imageId) => s3_helper.newLevelUrl(imageId))
      );

      prop[0] = prop[0].toJSON();

      prop[0].urls = shortUrls;

      return res.json({
        status: 200,
        property: prop[0]
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "An error occurred while fetching the property"
      });
    }
  }

  /*
***********************************************************************************************************
------------------------------- postProperties controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async postProperties(req, res) {
    const myPlace = await placeDB.findPlaceById(req.body.location)
    const slug = slugify(`${req.body.title} ${myPlace.district}`, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: false, // convert to lower case, defaults to `false`
      strict: false, // strip special characters except replacement, defaults to `false`
      locale: 'vi', // language code of the locale to use
      trim: true // trim leading and trailing replacement chars, defaults to `true`
    })
    const nProperty = { title: req.body.title,
      imageIds: req.body.imageIds,
      details: req.body.details,
      price: req.body.price,
      property_type: req.body.property_type,
      property_size: req.body.property_size,
      hasParking: req.body.hasParking,
      isForSale: req.body.isForSale,
      isForRent: req.body.isForRent,
      isLand: req.body.isLand,
      location: req.body.location, // District, Sector
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      isSold: req.body.isSold,
      hasPool: req.body.hasPool,
      appliances: req.body.appliances,
      yearBuilt: req.body.yearBuilt,
      AC: req.body.AC,
      YTUrl: req.body.YTUrl,
      slug,
      userId: req.user.id }
    const data = await propertiesDB.saveProperty(nProperty)
    res.status(201).json({
      status: 201,
      message: 'property created successfully',
      data
    })
  }

  /*
***********************************************************************************************************
------------------------------- updateProperty controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async updateProperty(req, res) {
    const doesExist = await propertiesDB.findProperty('id', req.params.id)
    if (doesExist.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "passed wrong id"
      })
    }
    const updatedAt = Date.now()
    const myPlace = await placeDB.findPlaceById(req.body.location)

    const slug = slugify(`${req.body.title} ${myPlace.district}`, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: false, // convert to lower case, defaults to `false`
      strict: false, // strip special characters except replacement, defaults to `false`
      locale: 'vi', // language code of the locale to use
      trim: true // trim leading and trailing replacement chars, defaults to `true`
    })

    const entry = { title: req.body.title,
      imageIds: req.body.imageIds,
      details: req.body.details,
      price: req.body.price,
      property_type: req.body.property_type,
      property_size: req.body.property_size,
      hasParking: req.body.hasParking,
      isForSale: req.body.isForSale,
      isForRent: req.body.isForRent,
      isLand: req.body.isLand,
      location: req.body.location, // District, Sector
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      isSold: req.body.isSold,
      hasPool: req.body.hasPool,
      appliances: req.body.appliances,
      yearBuilt: req.body.yearBuilt,
      AC: req.body.AC,
      YTUrl: req.body.YTUrl,
      slug,
      userId: req.user.id,
      updatedAt }
    const newProp = await propertiesDB.updateProperty(req.params.id, entry)
    if (!newProp[0]) {
      res.status(400).json({
        status: 400,
        error: "invalid column"
      })
    } else {
      res.status(200).json({
        status: 200,
        message: `property with ${req.params.id} updated successfully`
      })
    }
  }

  /*
***********************************************************************************************************
------------------------------- deleteProperty controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async deletePropertyRoute(req, res) {
    const doesExist = await propertiesDB.findProperty('id', req.params.id)
    if (doesExist.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "passed wrong id"
      })
    }

    const imagesToDelete = req.body.images
    const s3Promises = [];

    for (let i = 0; i < imagesToDelete.length; i += 1) {
      const uploadPromise = s3_helper.deleteObject(imagesToDelete[i])
      s3Promises.push(uploadPromise);
    }
    await Promise.all(s3Promises);
    await propertiesDB.deleteProperty(req.params.id)
    res.status(200).json({
      status: 200,
      message: `property with id ${req.params.id} was deleted successfully`
    })
  }

  /*
***********************************************************************************************************
------------------------------- property_img controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async property_img(req, res) {
    const doesExist = await propertiesDB.findProperty('id', req.params.id)
    if (doesExist.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "passed wrong id"
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "No files were uploaded"
      });
    }

    const isImage = await propertiesDB.getOneProp(req.params.id)

    if (isImage.imageIds) {
      await Promise.all(
        isImage.imageIds.map(
          (element) => s3_helper.deleteObject(element)
        )
      )
    }

    const imageIds = [];
    const s3Promises = [];

    for (let i = 0; i < req.files.length; i += 1) {
      const file = req.files[i];
      const randomImageName = (bytes = 12) => crypto.randomBytes(bytes).toString('hex');
      const key = `property/${randomImageName()}`;
      const uploadPromise = s3_helper.s3_objPut(key, file.buffer, file.mimetype);
      imageIds.push(key);
      s3Promises.push(uploadPromise);
    }

    try {
      await Promise.all(s3Promises);
      const prop = await propertiesDB.updateProperty(req.params.id, { imageIds });
      res.json({
        status: 200,
        message: "Property images uploaded successfully"
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: "Error uploading images",
        details: err.message
      });
    }
  }

  /*
***********************************************************************************************************
------------------------------- addProperty_img controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async addProperty_img(req, res) {
    const id = parseInt(req.params.id, 10)
    const doesExist = await propertiesDB.fetchOneProperty(id)

    if (!doesExist) {
      return res.status(404).json({
        status: 404,
        error: 'property not found'
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 400,
        error: "No files were uploaded"
      });
    }
    const isImage = await propertiesDB.getOneProp(req.params.id)

    const imageIds = doesExist.imageIds;
    const s3Promises = [];

    for (let i = 0; i < req.files.length; i += 1) {
      const file = req.files[i];
      const randomImageName = (bytes = 12) => crypto.randomBytes(bytes).toString('hex');
      const key = `property/${randomImageName()}`;
      const uploadPromise = s3_helper.s3_objPut(key, file.buffer, file.mimetype);
      imageIds.push(key);
      s3Promises.push(uploadPromise);
    }

    try {
      await Promise.all(s3Promises);
      const prop = await propertiesDB.updateProperty(req.params.id, { imageIds });
      res.json({
        status: 200,
        message: "Property images uploaded successfully"
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: "Error uploading images",
        details: err.message
      });
    }
  }

  /*
***********************************************************************************************************
------------------------------- deleteProperty_img controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async deleteProperty_img(req, res) {
    const id = parseInt(req.params.id, 10);
    const doesExist = await propertiesDB.fetchOneProperty(id);

    if (!doesExist) {
      return res.status(404).json({
        status: 404,
        error: 'Property not found'
      });
    }

    const imagesToDelete = req.body.images;
    const s3Promises = [];

    const myImgIds = [...doesExist.imageIds]; // Create a copy of the image IDs array

    for (let i = 0; i < imagesToDelete.length; i += 1) {
      const imageId = imagesToDelete[i];
      if (myImgIds.includes(imageId)) {
        s3Promises.push(s3_helper.deleteObject(imageId));
        myImgIds.splice(myImgIds.indexOf(imageId), 1);
      }
    }

    const entry = { imageIds: myImgIds }
    try {
      await Promise.all(s3Promises); // Wait for all S3 deletions to complete
      await propertiesDB.updateProperty(id, entry); // Update the property with the remaining image IDs
      res.json({
        status: 200,
        message: "Property images deleted successfully"
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: "Error deleting images",
        details: err.message
      });
    }
  }

  /*
***********************************************************************************************************
------------------------------- featured controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async featured(req, res) {
    let property = await propertiesDB.getMostRated()
    property = property.toJSON()
    property.url = await Promise.all(property.imageIds.map((Element) => s3_helper.newLevelUrl(Element)))

    res.json({
      status: 200,
      message: 'property found',
      property
    })
  }

  /*
***********************************************************************************************************
------------------------------- getOnePropertyBySlag controller ---------------------------------------------------
***********************************************************************************************************
*/
  static async getOnePropertyBySlag(req, res) {
    try {
      const prop = await propertiesDB.findProperty('slug', req.params.slug);

      if (!prop || prop.length === 0) {
        return res.status(404).json({
          status: 404,
          error: "Property not found"
        });
      }

      const shortUrls = await Promise.all(
        prop[0].imageIds.map((imageId) => s3_helper.newLevelUrl(imageId))
      );

      prop[0] = prop[0].toJSON();

      prop[0].urls = shortUrls;

      return res.json({
        status: 200,
        property: prop[0]
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "An error occurred while fetching the property"
      });
    }
  }
}

export default propertiesController
