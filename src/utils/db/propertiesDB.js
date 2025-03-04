// import { Sequelize, where } from 'sequelize';
// import models from '../../database/models';

// const { place, property, category, user, rating } = models;
// /* eslint-disable require-jsdoc */

// class propertiesDB {
//   static async getAllProperties() {
//     const holder = await property.findAll({
//       order: [['createdAt', 'DESC']],
//       where: { isSold: false },
//       include: [
//         {
//           model: category,
//           as: 'property-type',
//           attributes: ['id', 'name'],
//           required: true
//         },
//         {
//           model: place,
//           as: 'locations',
//           attributes: ['id', 'province', 'district', 'sector', 'knownName']
//         },
//       ],
//       attributes: {
//         exclude: ['location']
//       }
//     });
//     return holder;
//   }

//   static async getOneProp(id) {
//     const newProperty = await property.findOne({ where: { id } })
//     return newProperty
//   }

//   static async saveProperty(entry) {
//     try {
//       const newProperty = await property.create({
//         ...entry,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
//       return newProperty;
//     } catch (error) {
//     // Handle the error, e.g., log it, throw a custom error, etc.
//       console.error('Error saving property:', error);
//       throw error; // Re-throw the error for upper layers to handle
//     }
//   }

//   static async fetchOneProperty(id) {
//     const myProperty = await property.findOne({
//       where: { id },
//       include: [
//         {
//           model: category,
//           as: 'property-type',
//           attributes: [],
//           required: true
//         },
//         {
//           model: place,
//           as: 'locations',
//           attributes: [],
//           required: true
//         }],
//       attributes: [
//         'id', 'title', 'details',
//         [Sequelize.col('type.name'), 'property_type'], 'property_size',
//         [
//           Sequelize.literal(
//             `CONCAT("place"."district", ' - ', "place"."sector", ' - ' ,"place"."knownName")`
//           ),
//           'location'
//         ], 'price', 'hasParking', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC'
//       ]
//     })
//     return myProperty
//   }

//   static async updateProperty(id, column, value) {
//     const updatedProperty = await property.update(
//       { [column]: value },
//       { where: { id } }
//     );
//     return updatedProperty;
//   }

//   static async findProperty(column, value) {
//     const holder = await property.findAll({
//       where: { [column]: value },
//       include: [
//         {
//           model: category,
//           as: 'type',
//           attributes: [],
//           required: true
//         },
//         {
//           model: place,
//           as: 'place',
//           attributes: [],
//           required: true
//         }],
//       attributes: [
//         'id', 'title', 'details',
//         [Sequelize.col('type.name'), 'property_type'], 'property_size',
//         [
//           Sequelize.literal(
//             `CONCAT("place"."district", ' - ', "place"."sector", ' - ' ,"place"."knownName")`
//           ),
//           'location'
//         ], 'price', 'hasParking', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC'
//       ]
//     })
//     return holder
//   }

//   static async searchProperty(location, property_type, price, property_size, isForSale, isForRent, isLand) {
//     const holder = await property.findAll({
//       order: [['id', 'DESC']],
//       where: {
//         [Sequelize.Op.and]: [
//           { location: { [Sequelize.Op.or]: location } },
//           { property_type: { [Sequelize.Op.or]: property_type } },
//           { price: { [Sequelize.Op.between]: price } },
//           { property_size: { [Sequelize.Op.between]: property_size } },
//           { isForSale },
//           { isForRent },
//           { isLand }
//         ]
//       },
//       include: [
//         {
//           model: category,
//           as: 'property-type',
//           attributes: [],
//           required: true
//         },
//         {
//           model: place,
//           as: 'locations',
//           attributes: [],
//           required: true
//         }],
//       attributes: [
//         'id', 'title', 'details',
//         [Sequelize.col('property-type.name'), 'property_type'],
//         [
//           Sequelize.literal(
//             `CONCAT("locations"."district", ' - ', "locations"."sector", ' - ' ,"locations"."knownName")`
//           ),
//           'location'
//         ], 'price', 'hasParking', 'isLand', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC', 'slug'
//       ]
//     });
//     return holder
//   }

//   static async deleteProperty(id) {
//     await property.destroy({ where: { id } });
//   }

//   static async findAllRecords(skip, start) {
//     const record = await property.findAndCountAll({
//       limit: skip,
//       offset: start,
//       // where: { approved: true },
//       order: [['createdAt', 'DESC']],
//       include: [
//         {
//           model: user,
//           as: 'user',
//           attributes: [
//             'id',
//             'firstname',
//             'lastname',
//             'profileImg',
//             'createdAt',
//             'updatedAt'
//           ]
//         },
//         {
//           model: category,
//           as: 'property-type',
//           attributes: ['name']
//         }
//       ],
//       attributes: {
//         include: [
//           [Sequelize.col('name'), 'property_type']
//         ]
//       }
//     })

//     return record
//   }

//   static async getMostRated() {
//     const holder = await property.findAll({
//       order: [['price', 'DESC']],
//       where: { isSold: false },
//       include: [
//         {
//           model: category,
//           as: 'property-type',
//           attributes: ['id', 'name'],
//           required: true
//         },
//         {
//           model: place,
//           as: 'locations',
//           attributes: ['id', 'province', 'district', 'sector', 'knownName'],
//           required: true
//         },
//         {
//           model: rating,
//           as: 'ratings',
//           attributes: [], // No need for individual rating fields
//           required: false // Allow properties without ratings
//         }
//       ],
//       attributes: {
//         include: [
//           [Sequelize.col('property-type.name'), 'property_type'],
//           // [
//           //   Sequelize.literal(
//           //     `CONCAT("place"."district", ' - ', "place"."sector", ' - ' ,"place"."knownName")`
//           //   ),
//           //   'location'
//           // ],
//           [
//             Sequelize.fn(
//               'ROUND',
//               Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rates')), 0),
//               1
//             ),
//             'rates',
//           ], 'hasPool', 'appliances', 'yearBuilt', 'AC'
//         ]
//       },
//       group: [
//         'property.id',
//         'ratings.id',
//         'property-type.id',
//         'property-type.name',
//         'locations.id',
//         // 'locations.province',
//         // 'locations.district',
//         // 'locations.sector',
//         // 'locations.knownName'
//       ],
//     });
//     return holder[0];
//   }
// }

// export default propertiesDB;

import { Sequelize, where } from 'sequelize';
import models from '../../database/models';

const { place, property, category, user, rating } = models;
/* eslint-disable require-jsdoc */

class propertiesDB {
  static async getAllProperties() {
    const holder = await property.findAll({
      order: [['createdAt', 'DESC']],
      where: { isSold: false },
      include: [
        {
          model: category,
          as: 'property-type',
          attributes: ['id', 'name'],
          required: true
        },
        {
          model: place,
          as: 'locations',
          attributes: ['id', 'province', 'district', 'sector', 'knownName']
        },
      ],
      attributes: {
        exclude: ['location']
      }
    });
    return holder;
  }

  static async getOneProp(id) {
    const newProperty = await property.findOne({ where: { id } })
    return newProperty
  }

  static async saveProperty(entry) {
    try {
      const newProperty = await property.create({
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return newProperty;
    } catch (error) {
    // Handle the error, e.g., log it, throw a custom error, etc.
      console.error('Error saving property:', error);
      throw error; // Re-throw the error for upper layers to handle
    }
  }

  static async updateProperty(id, entry) {
    const updatedProperty = await property.update(
      entry,
      { where: { id } }
    );
    return updatedProperty;
  }

  static async findProperty(column, value) {
    const holder = await property.findAll({
      where: { [column]: value },
      include: [
        {
          model: category,
          as: 'property-type',
          attributes: [],
          required: true
        },
        {
          model: place,
          as: 'locations',
          attributes: [],
          required: true
        }],
      attributes: [
        'id', 'title', 'details',
        [Sequelize.col('property-type.name'), 'property_type'], 'property_size', 'slug',
        [
          Sequelize.literal(
            `CONCAT("locations"."district", ' - ', "locations"."sector", ' - ' ,"locations"."knownName")`
          ),
          'location'
        ], 'price', 'hasParking', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC', 'YTUrl'
      ]
    });
    return holder
  }

  static async searchProperty(location, property_type, price, property_size, isForSale, isForRent, isLand) {
    const holder = await property.findAll({
      order: [['id', 'DESC']],
      where: {
        [Sequelize.Op.and]: [
          { location: { [Sequelize.Op.or]: location } },
          { property_type: { [Sequelize.Op.or]: property_type } },
          { price: { [Sequelize.Op.between]: price } },
          { property_size: { [Sequelize.Op.between]: property_size } },
          { isForSale },
          { isForRent },
          { isLand }
        ]
      },
      include: [
        {
          model: category,
          as: 'property-type',
          attributes: [],
          required: true
        },
        {
          model: place,
          as: 'locations',
          attributes: [],
          required: true
        }],
      attributes: [
        'id', 'title', 'details',
        [Sequelize.col('property-type.name'), 'property_type'],
        [
          Sequelize.literal(
            `CONCAT("locations"."district", ' - ', "locations"."sector", ' - ' ,"locations"."knownName")`
          ),
          'location'
        ], 'price', 'hasParking', 'isLand', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC', 'slug'
      ]
    });
    return holder
  }

  static async deleteProperty(id) {
    await property.destroy({ where: { id } });
  }

  static async findAllRecords(skip, start) {
    const record = await property.findAndCountAll({
      limit: skip,
      offset: start,
      // where: { approved: true },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: user,
          as: 'user',
          attributes: [
            'id',
            'firstname',
            'lastname',
            'profileImg',
            'createdAt',
            'updatedAt'
          ]
        },
        {
          model: category,
          as: 'property-type',
          attributes: ['name']
        }
      ],
      attributes: {
        include: [
          [Sequelize.col('name'), 'property_type']
        ]
      }
    })

    return record
  }

  static async getMostRated() {
    const holder = await property.findAll({
      order: [['price', 'DESC']],
      where: { isSold: false },
      include: [
        {
          model: category,
          as: 'property-type',
          attributes: ['id', 'name'],
          required: true
        },
        {
          model: place,
          as: 'locations',
          attributes: ['id', 'province', 'district', 'sector', 'knownName'],
          required: true
        },
        {
          model: rating,
          as: 'ratings',
          attributes: [], // No need for individual rating fields
          required: false // Allow properties without ratings
        }
      ],
      attributes: {
        include: [
          [Sequelize.col('property-type.name'), 'property_type'],
          // [
          //   Sequelize.literal(
          //     `CONCAT("place"."district", ' - ', "place"."sector", ' - ' ,"place"."knownName")`
          //   ),
          //   'location'
          // ],
          [
            Sequelize.fn(
              'ROUND',
              Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rates')), 0),
              1
            ),
            'rates',
          ], 'hasPool', 'appliances', 'yearBuilt', 'AC'
        ]
      },
      group: [
        'property.id',
        'ratings.id',
        'property-type.id',
        'property-type.name',
        'locations.id',
        // 'locations.province',
        // 'locations.district',
        // 'locations.sector',
        // 'locations.knownName'
      ],
    });
    return holder[0];
  }

  static async fetchOneProperty(id) {
    const myProperty = await property.findOne({
      where: { id },
      include: [
        {
          model: category,
          as: 'property-type',
          attributes: [],
          required: true
        },
        {
          model: place,
          as: 'locations',
          attributes: [],
          required: true
        }],
      attributes: [
        'id', 'title', 'details',
        [Sequelize.col('property-type.name'), 'property_type'], 'property_size', 'slug',
        [
          Sequelize.literal(
            `CONCAT("locations"."district", ' - ', "locations"."sector", ' - ' ,"locations"."knownName")`
          ),
          'location'
        ], 'price', 'hasParking', 'isForSale', 'isForRent', 'bedrooms', 'bathrooms', 'imageIds', 'hasPool', 'appliances', 'yearBuilt', 'AC', 'YTUrl'
      ]
    })
    return myProperty
  }
}

export default propertiesDB;
