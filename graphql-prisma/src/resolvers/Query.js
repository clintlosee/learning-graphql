const Query = {
  users(parent, args, { prisma }, info) {
    return prisma.query.users(null, info)

    // if (!args.query) {
    //   return db.users
    // }

    // return db.users.filter((user) => {
    //   return db.user.name.toLowerCase().includes(args.query.toLowerCase())
    // })
  },
  posts(parent, args, { prisma }, info) {
    return prisma.query.posts(null, info)

    // if (!args.query) {
    //   return db.posts
    // }

    // return db.posts.filter((post) => {
    //   return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
    // })
  },
  comments(parent, args, { db }, info) {
    if (!args.query) {
      return db.comments
    }

    return db.comments.filter((comment) => {
      return comment.text.toLowerCase().includes(args.query.toLowerCase()) || comment.id.includes(args.query)
    })
  },
}

export { Query as default }
