import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from '../utils/getUserId'

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const emailTaken = await prisma.exists.User({ email: args.data.email })

    if (emailTaken) {
      throw new Error('Email taken')
    }

    if (args.data.password.length < 8) {
      throw new Error('Password must be 8 characters or longer.')
    }

    const password = await bcrypt.hash(args.data.password, 10)

    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: jwt.sign({ userId: user.id }, 'thisisasecret')
    }
  },

  async updateUser(parent, args, { prisma }, info) {
    const userExists = await prisma.exists.User({ id: args.id })

    if (!userExists) {
      throw new Error('User not found')
    }

    return prisma.mutation.updateUser({
      where: {
        id: args.id
      },
      data: args.data
    }, info)
  },

  async deleteUser(parent, args, { prisma }, info) {
    const userExists = await prisma.exists.User({ id: args.id })

    if (!userExists) {
      throw new Error('User not found')
    }

    return prisma.mutation.deleteUser({
      where: {
        id: args.id
      }
    }, info)
  },

  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    });

    if (!user) {
      throw new Error(`Unable to login`); //* Be generic
    }

    const valid = await bcrypt.compare(args.data.password, user.password)

    if (!valid) {
      throw new Error(`Unable to login`) //* Be generic
    }

    const token = jwt.sign({ userId: user.id }, 'thisisasecret')

    return {
      user,
      token
    }
  },

  async createPost(parent, args, { prisma, request }, info) {
    const userExists = await prisma.exists.User({ id: args.data.author })

    if (!userExists) {
      throw new Error('User not found')
    }

    const userId = getUserId(request)

    return prisma.mutation.createPost({
      data: {
        title: args.data.title,
        body: args.data.body,
        published: args.data.published,
        author: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },

  async updatePost(parent, args, { prisma }, info) {
    const postExists = await prisma.exists.Post({ id: args.id })

    if (!postExists) {
      throw new Error('Post not found')
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id
      },
      data: args.data
    }, info)
  },

  async deletePost(parent, args, { prisma }, info) {
    const postExists = await prisma.exists.Post({ id: args.id })

    if (!postExists) {
      throw new Error('Post not found')
    }

    return prisma.mutation.deletePost({
      where: {
        id: args.id
      }
    }, info)
  },

  async createComment(parent, args, { prisma }, info) {
    return prisma.mutation.createComment({
      data: {
        text: args.data.text,
        author: {
          connect: {
            id: args.data.author
          }
        },
        post: {
          connect: {
            id: args.data.post
          }
        }
      }
    }, info)
  },

  async updateComment(parent, args, { prisma }, info) {
    const commentExists = await prisma.exists.Comment({ id: args.id })

    if (!commentExists) {
      throw new Error('Comment not found')
    }

    return prisma.mutation.updateComment({
      where: {
        id: args.id
      },
      data: args.data
    }, info)
  },

  async deleteComment(parent, args, { prisma }, info) {
    const commentExists = await prisma.exists.Comment({ id: args.id })

    if (!commentExists) {
      throw new Error('Comment not found')
    }

    return prisma.mutation.deleteComment({
      where: {
        id: args.id
      }
    }, info)
  }
}

export { Mutation as default }
