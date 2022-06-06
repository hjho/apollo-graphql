// const { ApolloServer, gql } = require("apollo-server"") // >> type:module 아니라면
import {ApolloServer, gql} from "apollo-server";

let tweets = [
    {
        id:"1",
        text: "first 1",
        userId: "2"
    },
    {
        id:"2",
        text: "second 2",
        userId: "1"
    }
]

let users = [
    {
        id: "1",
        firstName: "Test",
        lastName: "User"
    },
    {
        id: "2",
        firstName: "Elon",
        lastName: "Mask"
    },
]

const typeDefs = gql`
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        """
        Is the sum of firstName + laseName as a string
        """
        fullName: String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Query {
        allTweets: [Tweet]!
        tweet(id: ID!): Tweet
        allUsers: [User!]!
        allMovies: [Movie!]!
        movie(id: String!): Movie
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        """ Delete a Tweet if found, else returns false """
        deleteTweet(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        allTweets(__) {
            return tweets;
        },
        tweet(root, {id}) {
            return tweets.find(tweet => tweet.id === id);
        },
        allUsers() {
            return users;
        },
        allMovies() {
            return fetch(`https://yts.mx/api/v2/list_movies.json`)
                .then(r => r.json())
                .then(json => json.data.movies);
        },
        movie(__, {id}) {
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
                .then(r => r.json())
                .then(json => json.data.movie);
        }
    },
    Mutation: {
        postTweet(__, {text, userId}) {
            const newTweet = {
                id: tweets.length + 1,
                text,
                userId
            }
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(__, {id}) {
            const tweet = tweets.find(tweet => tweet.id === id);
            if(!tweet) return false;
            tweets = tweets.filter(tweet => tweet.id !== id)
            return true;
        },
    },
    User: {
        fullName({firstName, lastName}) {
            return `${firstName} ${lastName}`;
        }
    },
    Tweet: {
        author(root) {
            return users.find(user => user.id === root.userId);
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
})