import { GraphQLServer } from 'graphql-yoga'

//* Demo user data
const users = [
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

const posts = [
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

const comments = [
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
    text: 'Another intersting comment here.',
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