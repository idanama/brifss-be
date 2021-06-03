import dotenv from 'dotenv';
import gql from 'graphql-tag';

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';


import ApolloClient from 'apollo-client';
import {
    InMemoryCache
} from 'apollo-cache-inmemory';

dotenv.config();

import {
    createHttpLink
} from 'apollo-link-http';
import {
    setContext
} from 'apollo-link-context';

let token;

const asyncAuthLink = setContext((_, {
        headers
    }) =>
    // eslint-disable-next-line no-undef
    new Promise((success, fail) => {
        // do some async lookup here
        {
            if (!token) {
                console.log("generate JWT for backend");

                token = jwt.sign({
                    "https://brifss.com/graphql": {
                        roles: ["admin"],
                        permissions: ["read:any_account", "read:own_account", "write:sources", "write:articles"],
                    }
                }, process.env.JWT_SECRET, {
                    algorithm: "HS256",
                    subject: "backendservice", // user id
                    expiresIn: "90d"
                });
            }
            const head = {
                headers: {
                    ...headers,
                    cookie: token ? `apollo-token=${token}` : "",
                }
            };
            success(head);
        }
    })
);

const httpLink = new createHttpLink({
    uri: process.env.GRAPHQL_URL,
    credentials: 'include',
    fetch
});

const apolloClient = new ApolloClient({
    link: asyncAuthLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            errorPolicy: 'all',
        },
    },
});

// apolloClient.mutate({
//         mutation: gql `
//         mutation userLogin($username:String,$password:String!)
//         {
//             userLogin(username:$username,password:$password){
//                jwt
//             }
//         }
//     `,
//         variables: {
//             username: process.env.GRAPHQL_USER,
//             password: process.env.GRAPHQL_PASS,
//         }
//     })
//     .then(res => {
//         // const token1 = res.data.userLogin.jwt;
//         const user = jwt.verify(res.data.userLogin.jwt, process.env.JWT_SECRET).sub;
//         console.log(user, " has logged in");
//     })
//     .catch((err => {
//         console.log("ERROR: couldn't login writer");
//         console.error(err);
//     }));

export default apolloClient;