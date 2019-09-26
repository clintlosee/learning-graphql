import uuidv4 from 'uuid/v4'

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const emailTaken = await prisma.exists.User({ email: args.data.email })

    if (emailTaken) {
      throw new Error('Email taken')
    }

    return prisma.mutation.createUser({ data: args.data }, info)
  },

  updateUser(parent, args, { db }, info) {
    const user = db.users.find(user => user.id === args.id)

    if (!user) {
      throw new Error('User not found.')
    }

    if (typeof args.data.email === 'string') {
      const emailTaken = db.users.some(user => user.email === args.data.email)

      if (emailTaken) {
        throw new Error('Email taken')
      }

      user.email = args.data.email
    }

    if (typeof args.data.name === 'string') {
      user.name = args.data.name
    }

    if (typeof args.data.age !== 'undefined') {
      user.age = args.data.age
    }

    return user
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

  createPost(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some(user => {
      return user.id === args.data.author
    })

    if (!userExists) {
      throw new Error('User not found.')
    }

    const post = {
      id: uuidv4(),
      ...args.data
    }

    db.posts.push(post)

    if (args.data.published) {
      pubsub.publish(`post`, {
        post: {
          mutation: 'CREATED',
          data: post
        }
      })
    }

    return post
  },

  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const post = db.posts.find(post => post.id === id)
    const originalPost = {...post}

    if (!post) {
      throw new Error('Post not found.')
    }

    if (typeof data.title === 'string') {
      post.title = data.title
    }

    if (typeof data.body === 'string') {
      post.body = data.body
    }

    if (typeof data.published === 'boolean') {
      post.published = data.published

      if (originalPost.published && !post.published) {
        //* deleted
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        })
      } else if (!originalPost.published && post.published) {
        //* created
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post
          }
        })
      }
    } else if (post.published) {
      //* updated
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }

    return post
  },

  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex(post => {
      return post.id === args.id
    })

    if (postIndex === -1) {
      throw new Error('Post not found.')
    }

    const [post] = db.posts.splice(postIndex, 1)

    db.comments = db.comments.filter(comment => {
      return comment.post !== args.id
    })

    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post
        }
      })
    }

    return post
  },

  createComment(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some(user => user.id === args.data.author)
    const postExists = db.posts.some(post => post.published && post.id === args.data.post)

    if (!userExists) {
      throw new Error('User not found.')
    }

    if (!postExists) {
      throw new Error('Post not found.')
    }

    const comment = {
      id: uuidv4(),
      ...args.data
    }

    db.comments.push(comment)

    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    })

    return comment
  },

  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const comment = db.comments.find(comment => comment.id === id)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (typeof data.text === 'string') {
      comment.text = data.text
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment
      }
    })

    return comment
  },

  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex(comment => {
      return comment.id === args.id
    })

    if (commentIndex === -1) {
      throw new Error('Comment not found.')
    }

    const [deletedComment] = db.comments.splice(commentIndex, 1)

    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    })

    return deletedComment
  }
}

export { Mutation as default }
