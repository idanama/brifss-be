import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import randomWords from "random-words";

import {
    User,
    UserTC
} from '../models/user';

dotenv.config();

UserTC.addResolver({
    name: 'userLogin',
    kind: "mutation",
    args: {
        username: 'String',
        password: 'String'
    },
    type: UserTC,
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        const user = await User.findOne({
            username: args.username
        });
        const match = await bcrypt.compare(args.password, user.password);
        if (match) {
            const token = await jwt.sign({
                "https://brifss.com/graphql": {
                    roles: user.roles,
                    permissions: user.permissions,
                }
            }, process.env.JWT_SECRET, {
                algorithm: "HS256",
                subject: String(user._id), // user id
                expiresIn: "90d"
            });
            return {
                jwt: token,
                username: user.username,
            };
        } else {
            return "error, could not login";
        }
    }
});

UserTC.addResolver({
    name: 'userInit',
    kind: "mutation",
    type: UserTC,
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        const username = randomWords({
            exactly: 4,
            join: '-'
        });
        const user = await User.create({
            username,
            password: Math.random().toString(36),
        });
        const token = await jwt.sign({
            "https://brifss.com/graphql": {
                roles: user.roles,
                permissions: user.permissions,
            }
        }, process.env.JWT_SECRET, {
            algorithm: "HS256",
            subject: String(user._id), // user id
            expiresIn: "90d"
        });
        return {
            jwt: token,
            username,
        };
    }
});


UserTC.addResolver({
    name: 'updateStats',
    type: UserTC,
    args: {
        // _id: 'MongoID!',
        stats: ['UserStatsInput']
    },
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        if (context.roles.account) {
            console.log(args.stats);
            const user = await User.updateOne({
                _id: context.user.sub
            }, {
                $addToSet: {
                    stats: args.stats
                }
            });
            if (!user) throw new Error(`User account not found.`);
            // return User.findOne({
            //     _id: context.user.sub
            // }); // return the record

            // TODO fix return dummy response
            return {
                username: ""
            };

        } else throw new Error(`You can't have access, please identify.`);

    }
});

const UserManagementQuery = {
    userById: UserTC.getResolver('findById'),
    userByIds: UserTC.getResolver('findByIds'),
    userOne: UserTC.getResolver('findOne'),
    userMany: UserTC.getResolver('findMany'),
    userCount: UserTC.getResolver('count'),
    userConnection: UserTC.getResolver('connection'),
    userPagination: UserTC.getResolver('pagination'),

};

const UserManagementMutation = {
    userCreateOne: UserTC.getResolver('createOne'),
    userCreateMany: UserTC.getResolver('createMany'),
    userUpdateById: UserTC.getResolver('updateById'),
    userUpdateOne: UserTC.getResolver('updateOne'),
    userUpdateMany: UserTC.getResolver('updateMany'),
    userRemoveById: UserTC.getResolver('removeById'),
    userRemoveOne: UserTC.getResolver('removeOne'),
    userRemoveMany: UserTC.getResolver('removeMany'),
};

const UserAuthenticatedMutation = {
    userUpdateStats: UserTC.getResolver('updateStats'),
};

const UserUnrestrictedMutation = {
    userLogin: UserTC.getResolver('userLogin'),
    userInit: UserTC.getResolver('userInit'),
};

export {
    UserManagementQuery,
    UserManagementMutation,
    UserAuthenticatedMutation,
    UserUnrestrictedMutation
};