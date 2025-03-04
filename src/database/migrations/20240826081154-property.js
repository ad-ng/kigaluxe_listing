const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('properties', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: Sequelize.STRING
    },
    imageIds: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    slug: {
      type: Sequelize.STRING,
    },
    details: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.INTEGER
    },
    property_type: {
      type: Sequelize.INTEGER,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    property_size: {
      type: Sequelize.INTEGER
    },
    hasParking: {
      type: Sequelize.BOOLEAN
    },
    isForSale: {
      type: Sequelize.BOOLEAN
    },
    isForRent: {
      type: Sequelize.BOOLEAN
    },
    isLand: {
      type: Sequelize.BOOLEAN
    },
    location: {
      type: Sequelize.INTEGER,
      references: {
        model: 'places',
        key: 'id'
      }
    },
    bedrooms: {
      type: Sequelize.INTEGER
    },
    bathrooms: {
      type: Sequelize.INTEGER
    },
    isSold: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    hasPool: {
      type: Sequelize.BOOLEAN
    },
    appliances: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    yearBuilt: {
      type: Sequelize.DATE
    },
    AC: {
      type: Sequelize.BOOLEAN
    },
    YTUrl: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });
};

const down = async (queryInterface) => {
  await queryInterface.dropTable('properties');
};

export { up, down };
