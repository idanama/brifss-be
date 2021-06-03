import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import {
    ApolloServer
} from 'apollo-server-express';
import gql from 'graphql-tag';

import apolloClient from './utils/apolloClient';


import mongoose from 'mongoose';

import expressJwt from "express-jwt";

import {
    applyMiddleware
} from 'graphql-middleware';

import './utils/apolloClient';

import './scripts/fetchRss';
import './scripts/fetchImages';

import './utils/db';
import schema from './schema';

import {
    userPermissions
} from "./utils/permissions";


dotenv.config();

const app = express();

app.use(cors({
    origin: [
        `${process.env.GRAPHQL_URL}`,
        'http://localhost:3000',
        'http://localhost:8080',
        'https://brifss.netlify.app',
        'https://brifss.netlify.app/graph',
        'https://brifss.com',
        'https://www.brifss.com',
        'https://idanamati.com',
        'https://www.idanamati.com',
    ],
    credentials: true
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(cookieParser());
const cookieMaxAge = 7889400000; // 3 months in milliseconds

app.get('/userinit', function (req, res) {
    apolloClient.mutate({
        mutation: gql `
            mutation userInit
            {
                userInit{
                    jwt
                    username
                }
            }
        `
    }).then(response => {
        res
            // .cookie('token', response.data.userInit.jwt)
            .send({
                username: response.data.userInit.username,
                jwt: response.data.userInit.jwt
            });
    }).catch(error => {
        console.error(error);
    });
});

app.get('/userlogin', function (req, res) {
    console.log(`login request username: ${req.body.username}`);
    apolloClient.mutate({
        mutation: gql `
            mutation userLogin($username:String,$password:String)
            {
                userLogin(username:$username,password:$password){
                    jwt
                    username
                }
            }
        `,
        variables: {
            username: req.body.username,
            password: req.body.password,
        }
    }).then(response => {
        res
            // .cookie('token', response.data.userLogin.jwt)
            .send({
                username: response.data.userLogin.username,
                jwt: response.data.userLogin.jwt
            });
    }).catch(error => {
        console.error(error);
    });
});


app.use(
    expressJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ["HS256"],
        credentialsRequired: false
    })
);

const server = new ApolloServer({
    schema,
    cors: true,
    // cors: false,
    playground: process.env.NODE_ENV === 'development' ? true : false,
    // playground: true,
    // playground: false,
    introspection: true,
    tracing: true,
    path: '/graph',
    context: ({
        req
    }) => {
        let user;
        if (req.cookies['apollo-token']) {
            user = jwt.verify(req.cookies['apollo-token'], process.env.JWT_SECRET);
        }
        const roles = userPermissions(user);
        return {
            user,
            roles
        };
    }
});

server.applyMiddleware({
    app,
    path: '/graph',
    cors: true,
    // cors: false,
    onHealthCheck: () =>
        // eslint-disable-next-line no-undef
        new Promise((resolve, reject) => {
            if (mongoose.connection.readyState > 0) {
                resolve();
            } else {
                reject();
            }
        }),
});

app.listen({
    port: process.env.PORT
}, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`);
    // console.log(`😷 Health checks available at ${process.env.HEALTH_ENDPOINT}`);
});