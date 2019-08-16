import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'
import db from './db'

// Resolvers (functions)
const resolvers = {
  Query: {
    users(parent, args, { db }, info) {
      if (!args.query) {
        return db.users
      }

      return db.users.filter((user) => {
        return db.user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, { db }, info) {
      if (!args.query) {
        return db.posts
      }

      return db.posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    comments(parent, args, { db }, info) {
      if (!args.query) {
        return db.comments
      }

      return db.comments.filter((comment) => {
        return comment.text.toLowerCase().includes(args.query.toLowerCase()) || comment.id.includes(args.query)
      })
    },
  },
  Mutation: {
    createUser(parent, args, { db }, info) {
      const emailTaken = db.users.some(user => {
        return user.email === args.data.email
      })

      if (emailTaken) {
        throw new Error('Email taken.')
      }

      const user = {
        id: uuidv4(),
        ...args.data
      }

      db.users.push(user)
      return user
    },

    deleteUser(parent, args, { db }, info) {
      const userIndex = db.users.findIndex(user => {
        return user.id === args.id
      })

      if (userIndex === -1) {
        throw new Error('User not found.')
      }

      const deletedUsers = db.users.splice(userIndex, 1)

      db.posts = db.posts.filter(post => {
        const match = post.author === args.id

        if (match) {
          db.comments = db.comments.filter(comment => {
            return comment.post !== post.id
          })
        }

        return !match
      })

      db.comments = db.comments.filter(comment => comment.author !== args.id)

      return deletedUsers[0]
    },

    createPost(parent, args, { db }, info) {
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

      return post
    },

    deletePost(parent, args, { db }, info) {
      const postIndex = db.posts.findIndex(post => {
        return post.id === args.id
      })

      if (postIndex === -1) {
        throw new Error('Post not found.')
      }

      const deletedPosts = db.posts.splice(postIndex, 1)

      db.comments = db.comments.filter(comment => {
        return comment.post !== args.id
      })

      return deletedPosts[0]
    },

    createComment(parent, args, { db }, info) {
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

      return comment
    },

    deleteComment(parent, args, { db }, info) {
      const commentIndex = db.comments.findIndex(comment => {
        return comment.id === args.id
      })

      if (commentIndex === -1) {
        throw new Error('Comment not found.')
      }

      const deletedComments = db.comments.splice(commentIndex, 1)

      return deletedComments[0]
    }
  },
  Post: {
    author(parent, args, { db }, info) {
      return db.users.find((user) => {
        return user.id === parent.author
      })
    },

    comments(parent, args, { db }, info) {
      return db.comments.filter(comment => {
        return comment.post === parent.id
      })
    }
  },
  User: {
    posts(parent, args, { db }, info) {
      return db.posts.filter((post) => {
        return post.author === parent.id
      })
    },

    comments(parent, args, { db }, info) {
      return db.comments.filter(comment => {
        return comment.author === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, { db }, info) {
      return db.users.find(user => {
        return user.id === parent.author
      })
    },

    post(parent, args, { db }, info) {
      return db.posts.find(post => {
        return post.id === parent.post
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db
  }
})

server.start(() => {
  console.log('Server is running...')
})