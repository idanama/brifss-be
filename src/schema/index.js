import {
    SchemaComposer
} from 'graphql-compose';

import db from '../utils/db'; // eslint-disable-line no-unused-vars

const schemaComposer = new SchemaComposer();

import {
    SourceQuery,
    SourceMutation,
} from './source';
import {
    ArticleQuery,
    ArticleMutation,
    ArticleViewerQuery,
    ArticleDemoQuery
} from './article';
import {
    UserManagementQuery,
    UserManagementMutation,
    UserAuthenticatedMutation,
    UserUnrestrictedMutation,
} from './user';

schemaComposer.Query.addFields({
    ...restrictAccess({
        ...ArticleViewerQuery,
        ...ArticleQuery,
    }, "viewer"),
    ...restrictAccess({
        ...UserManagementQuery,
    }, "admin"),
    ...ArticleDemoQuery,
    ...SourceQuery,

});

schemaComposer.Mutation.addNestedFields({
    ...UserUnrestrictedMutation,
    ...restrictAccess({
        ...UserManagementMutation,
    }, "admin"),
    ...restrictAccess({
        ...UserAuthenticatedMutation,
    }, "viewer"),
    ...restrictAccess({
        ...ArticleMutation,
        ...SourceMutation,
    }, "writer"),
});

function restrictAccess(resolvers, role) {
    Object.keys(resolvers).forEach(k => {
        resolvers[k] = resolvers[k].wrapResolve(next => rp => {
            if (!rp.context.roles[role]) {
                console.log(rp.context);
                throw new Error(`You should be ${role}, to have access to this action.`);
            }
            return next(rp);
        });
    });
    return resolvers;
}

export default schemaComposer.buildSchema();