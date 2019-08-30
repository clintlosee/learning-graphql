import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466'
})

//* Async/Await Prisma calls =====================
const createPostForUser = async (authorId, data) => {
  const post = await prisma.mutation.createPost({
    data: {
      ...data,
      author: {
        connect: {
          id: authorId
        }
      }
    }
  }, '{ id }')

  const user = await prisma.query.user({
    where: {
      id: authorId
    }
  }, '{ id name email posts { id title published } }')

  return user
}

// createPostForUser("cjzoge18900s909104roaw9xx", {
//     title: 'Great Articles to Read',
//     body: 'How to build a GraphQL API and all its tricks.',
//     published: true
//   }
// ).then(user => {
//   console.log(JSON.stringify(user, undefined, 2))
// })

const updatePostForUser = async (postId, data) => {
  const post = await prisma.mutation.updatePost({
    where: {
      id: postId
    },
    data
  }, '{ author { id } }')

  const user = await prisma.query.user({
    where: {
      id: post.author.id
    }
  }, '{ id name email posts { id title published } }')

  return user
}

// updatePostForUser('cjzy8j3w3004g08103gszazh3', {
//   published: false
// }).then(user => {
//   console.log(JSON.stringify(user, undefined, 2))
// })


//* Old individual Prisma calls =======================================
// prisma.query.users(null, '{ id name posts { id title } }').then((data) => {
//   console.log(JSON.stringify(data, undefined, 2))
// })

// prisma.query.comments(null, '{ id text author { id name } }').then((data) => {
//   console.log(JSON.stringify(data, undefined, 2))
// })

// prisma.mutation.createPost({
//   data: {
//     title: "GraphQL 101",
//     body: "",
//     published: false,
//     author: {
//       connect: {
//         id: "cjzogb2xa00qu0910lu99assw"
//       }
//     }
//   }
// }, '{ id title body published }').then(data => {
//   console.log(data)
//   return prisma.query.users(null, '{ id name posts { id title } }')
// }).then((data) => {
//   console.log(JSON.stringify(data, undefined, 2))
// })

// prisma.mutation.updatePost({
//   where: {
//     id: "cjzwz83qn002g081059lneyqg"
//   },
//   data: {
//     body: "Here is the new post body that is updated. Cool...",
//     published: true
//   }
// }, '{ id title body published }').then(data => {
//   console.log(data)
//   return prisma.query.posts(null, '{ id title body published author { id name } }')
// }).then(data => {
//   console.log(JSON.stringify(data, undefined, 2))
// })