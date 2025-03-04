const placeDefinition = (sequelize, DataTypes) => {
  const place = sequelize.define('place', {
    province: { type: DataTypes.STRING },
    district: { type: DataTypes.STRING },
    sector: { type: DataTypes.STRING },
    knownName: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    img: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    slug: { type: DataTypes.STRING }
  }, {})

  place.associate = (models) => {
    place.hasMany(models.property, {
      foreignKey: 'location',
      as: 'properties',
      onDelete: 'CASCADE'
    });
  }

  return place
}

export default placeDefinition
