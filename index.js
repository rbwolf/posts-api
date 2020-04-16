const { graphql } = require('graphql')
const { ApolloServer, gql } = require('apollo-server')
const { find, filter } = require('lodash')
const uuid = require('uuid/v4')

const typeDefs = gql`
  type Query {
    post(id: String!): Post
    posts: [Post]!
    comments: [Comment]!
  }

  type Mutation {
    createPost(title: String!, author: String!, body: String!): Post
    addComment(postId: String!, author: String, body: String!): Comment
  }

  type Post {
    id: String!
    title: String!
    author: String!
    body: String!
    comments: [Comment]!
    commentCount: Int
  }

  type Comment {
    id: String!
    author: String
    body: String!
  }
`

const posts = []
const comments = []

// (parent, args, context, info)
const resolvers = {
  Query: {
    post: (_, args) => find(posts, { id: args.id }),
    posts: () => posts,
    comments: () => comments,
  },
  Mutation: {
    createPost: (_, {title, author, body}) => {
      const post = {id: uuid(), title, author, body, comments: []}
      posts.push(post)
      return post
    },
    addComment: (_, {postId, author, body}) => {
      const comment = {id: uuid(), author: author || 'Anonymous', body}
      comments.push(comment)
      const post = find(posts, {id: postId})
      post && post.comments.push(comment.id)
      return comment
    }
  },
  Post: {
    comments: (parent) => filter(comments, (comment) => parent.comments.includes(comment.id)),
    commentCount: (parent) => filter(comments, (comment) => parent.comments.includes(comment.id)).length
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
