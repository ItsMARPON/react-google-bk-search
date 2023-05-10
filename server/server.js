const express = require("express");
const path = require("path");
// Import the ApolloServer class
const { ApolloServer } = require("apollo-server-express");

// Import authmiddleware to verify token
const { authMiddleware } = require("./utils/auth");

// Import typeDefs and resolvers - GraphQL schema
const { typeDefs, resolvers } = require("./schemas");

const db = require("./config/connection");

const app = express();
const PORT = process.env.PORT || 3001;
// use ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get('/', (req, res)=> {
 res.sendFile(path.join(__dirname, "../client")); 
})


// Create a new instance of an Apollo server with GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server

startApolloServer(typeDefs, resolvers).then((r) =>
  console.log(`Server has been started!`)
);
