/* eslint-disable require-jsdoc */
import { Sequelize, where } from 'sequelize';
import models from '../../database/models';

const { blog, comment, user, sequelize, category } = models;

class blogService {
  static async findAllBlogs() {
    const blogs = await blog.findAll({
      order: [
        ['id', 'DESC']
      ],
      include: [
        {
          model: user,
          as: 'author',
          attributes: ['firstName', 'lastName']
        }],
      attributes: {
        include: [
          [
            sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM comments AS comment
                    WHERE
                    comment."blogId" = blog.id
                  )`),
            'commentCount'
          ]
        ],
        exclude: ['authorId']
      },
      group: ['blog.id', 'author.id'],
    });
    return blogs;
  }

  static async findOneBlog(id) {
    const currentBlog = await blog.findOne({
      where: { id },
      include: [{
        model: comment,
        as: 'comments',
        attributes: ["content"],
        include: [{
          model: user,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      },
      {
        model: user,
        as: 'author',
        attributes: ['firstName', 'lastName', 'profileImg']
      },
      {
        model: category,
        as: 'blogCategory',
        attributes: ['name']
      }],
      attributes: { exclude: ['authorId'] }
    })
    return currentBlog
  }

  static async findOneBlogBySlug(slug) {
    const currentBlog = await blog.findOne({
      where: { slug },
      include: [{
        model: comment,
        as: 'comments',
        attributes: ["content"],
        include: [{
          model: user,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      },
      {
        model: user,
        as: 'author',
        attributes: ['firstName', 'lastName', 'profileImg']
      },
      {
        model: category,
        as: 'blogCategory',
        attributes: ['name']
      }],
      attributes: { exclude: ['authorId'] }
    })
    return currentBlog
  }

  static async createBlog(entry) {
    try {
      const newBlog = await blog.create({
        ...entry,
        savedId: 0,
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return newBlog
    } catch (error) {
      return error.message
    }
  }

  static async updateBlog(id, entry) {
    try {
      const newBlog = await blog.update(
        { ...entry, updatedAt: new Date() },
        { where: { id } }
      )
      return newBlog
    } catch (error) {
      return error.message
    }
  }

  static async deleteB(id) {
    try {
      await blog.destroy({ where: { id } })
    } catch (error) {
      return error.message
    }
  }

  static async finder(entry) {
    const newBlogs = await blog.findAll({
      where: { [Sequelize.Op.or]: [
        { title: { [Sequelize.Op.iLike]: `%${entry}%` } },
        { content: { [Sequelize.Op.iLike]: `%${entry}%` } }
      ] }
    })
    return newBlogs
  }
}

export default blogService
