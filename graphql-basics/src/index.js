import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

//* Demo user data
let users = [
  {
    id: '1',
    name: 'Clint',
    email: 'email@email.com',
    age: 38
  },
  {
    id: '2',
    name: 'Mellissa',
    email: 'emailMellissa@email.com',
    age: 39
  }
]

let posts = [
  {
    id: '1',
    title: 'Post 1, Sweet!',
    body: 'This is the body of my post #1.',
    published: true,
    author: '1'
  },
  {
    id: '2',
    title: 'Post 2 That is Cool',
    body: 'This is the body of my post #2 that has more body text.',
    published: false,
    author: '2'
  }
]

let comments = [
  {
    id: '101',
    text: 'This is comment one.',
    author: '1',
    post: '2'
  },
  {
    id: '102',
    text: 'Cool comment number 2.',
    author: '1',
    post: '2'
  },
  {
    id: '103',
    text: 'Another interesting comment here.',
    author: '2',
    post: '1'
  },
  {
    id: '104',
    text: 'Here is a cool comment.',
    author: '1',
    post: '2'
  }
]

// Type Definitions (schema)
const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
    add(numbers: [Float]!): Float!
    greeting(name: String): String!
    grades: [Int!]!
    me: User!
    post: Post!
  }

  type Mutation {
    createUser(data: CreateUserInput): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput): Comment!
    deleteComment(id: ID!): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`

// Resolvers (functions)
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts
      }

      return posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return comments
      }

      return comments.filter((comment) => {
        return comment.text.toLowerCase().includes(args.query.toLowerCase()) || comment.id.includes(args.query)
      })
    },
    add(parent, args, ctx, info) {
      if (args.numbers.length === 0) {
        return
      }

      return args.numbers.reduce((acc, val) => {
        return acc + val
      })
    },
    greeting(parent, args, ctx, info) {
      if (args.name) {
        return `Hello, ${args.name}!`
      } else {
        return 'Hello!'
      }
    },
    grades(parent, args, ctx, info) {
      return [99, 80, 93]
    },
    me() {
      return {
        id: '12389',
        name: 'Clint',
        email: 'email@1gmail.com',
      }
    },
    post() {
      return {
        id: '1212',
        title: 'My Fist Post',
        body: 'This is the body of my first post.',
        published: true
      }
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.data.email
      })

      if (emailTaken) {
        throw new Error('Email taken.')
      }

      const user = {
        id: uuidv4(),
        ...args.data
      }

      users.push(user)
      return user
    },

    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex(user => {
        return user.id === args.id
      })

      if (userIndex === -1) {
        throw new Error('User not found.')
      }

      const deletedUsers = users.splice(userIndex, 1)

      posts = posts.filter(post => {
        const match = post.author === args.id

        if (match) {
          comments = comments.filter(comment => {
            return comment.post !== post.id
          })
        }

        return !match
      })

      comments = comments.filter(comment => comment.author !== args.id)

      return deletedUsers[0]
    },

    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.data.author
      })

      if (!userExists) {
        throw new Error('User not found.')
      }

      const post = {
        id: uuidv4(),
        ...args.data
      }

      posts.push(post)

      return post
    },

    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex(post => {
        return post.id === args.id
      })

      if (postIndex === -1) {
        throw new Error('Post not found.')
      }

      const deletedPosts = posts.splice(postIndex, 1)

      comments = comments.filter(comment => {
        return comment.post !== args.id
      })

      return deletedPosts[0]
    },

    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.data.author)
      const postExists = posts.some(post => post.published && post.id === args.data.post)

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

      comments.push(comment)

      return comment
    },

    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex(comment => {
        return comment.id === args.id
      })

      if (commentIndex === -1) {
        throw new Error('Comment not found.')
      }

      const deletedComments = comments.splice(commentIndex, 1)

      return deletedComments[0]
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author
      })
    },

    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.post === parent.id
      })
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id
      })
    },

    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.author === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },

    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.post
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('Server is running...')
})