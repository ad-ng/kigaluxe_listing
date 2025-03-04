const up = (queryInterface, Sequelize) => queryInterface.createTable('blogs', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  title: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.TEXT
  },
  authorId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE', // Ensure cascading delete
  },
  categoryId: {
    type: Sequelize.INTEGER
  },
  featuredImg: {
    type: Sequelize.STRING
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  slug: {
    type: Sequelize.STRING
  }
});

const down = (queryInterface) => queryInterface.dropTable('blogs');

export { up, down };
