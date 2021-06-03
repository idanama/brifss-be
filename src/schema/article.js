import {
    Article,
    ArticleTC
} from '../models/article';

import {
    Source,
    SourceTC
} from '../models/source';


ArticleTC.addResolver({
    name: 'pushToArray',
    type: ArticleTC,
    args: {
        _id: 'MongoID!',
        imageUrl: 'String'
    },
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        const article = await Article.updateOne({
            _id: args._id
        }, {
            $addToSet: {
                imageUrl: args.imageUrl
            }
        });
        if (!article) return null; // or gracefully return an error etc...
        return Article.findOne({
            _id: args.userId
        }); // return the record
    }
});



ArticleTC.addRelation(
    'source', {
        resolver: () => SourceTC.getResolver('findById'),
        prepareArgs: { // resolver `findById` has `_id` arg, let provide value to it
            _id: (articleArgs) => articleArgs.source,
        },
        projection: {
            source: 1
        }, // point fields in source object, which should be fetched from DB
    }
);

ArticleTC.addResolver({
    name: 'articlesGetNew',
    kind: "query",
    type: [ArticleTC],
    args: {
        fetchFroms: '[String]',
        sources: '[MongoID!]'
    },
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        // compound filter
        // $or: [
        //     {
        //         source
        //         createdAt
        //     }
        //     ...
        // ]
        const filterArray = [];
        args.sources.forEach((source, i) => {
            filterArray.push({
                source: args.sources[i],
                createdAt: {
                    $gte: args.fetchFroms[i]
                }
            });
        });
        const filterQuery = {
            $or: filterArray
        };
        const articles = await Article.find(filterQuery);
        if (!articles) return null; // or gracefully return an error etc...
        return articles;
    },
    prepareArgs: {
        limit: 7
    }
});


ArticleTC.addResolver({
    name: 'articleGetDemo',
    kind: "query",
    type: [ArticleTC],
    resolve: async ({
        source,
        args,
        context,
        info
    }) => {
        const sources = await Source.find({
            name: { $in: ['The Verge', 'The Guardian', 'New York Times'] }
        });
        const sourceList = [];
        sources.forEach(source => {
            sourceList.push({
                source: source._id
            });
        });
        const articles = await Article.find({
            $or: [...sourceList],
            title: {
                $not: {
                    $regex: /trump/gi
                }
            },
            'imageUrl.0': {$exists: true}
        }).sort({
            createdAt: 'desc'
        }).limit(12);
        if (!articles) return null; // or gracefully return an error etc...
        return articles;
    }
});



const ArticleQuery = {
    articleByIds: ArticleTC.getResolver('findByIds'),
    articleOne: ArticleTC.getResolver('findOne'),
    articleMany: ArticleTC.getResolver('findMany'),
    articleCount: ArticleTC.getResolver('count'),
    articleConnection: ArticleTC.getResolver('connection'),
    articlePagination: ArticleTC.getResolver('pagination'),
};

const ArticleViewerQuery = {
    articlesGetNew: ArticleTC.getResolver('articlesGetNew'),
    articleById: ArticleTC.getResolver('findById'),
};

const ArticleDemoQuery = {
    articleDemo: ArticleTC.getResolver('articleGetDemo')
};

const ArticleMutation = {
    articleCreateOne: ArticleTC.getResolver('createOne'),
    articleCreateMany: ArticleTC.getResolver('createMany'),
    articleUpdateById: ArticleTC.getResolver('updateById'),
    articleUpdateOne: ArticleTC.getResolver('updateOne'),
    articleUpdateMany: ArticleTC.getResolver('updateMany'),
    articleRemoveById: ArticleTC.getResolver('removeById'),
    articleRemoveOne: ArticleTC.getResolver('removeOne'),
    articleRemoveMany: ArticleTC.getResolver('removeMany'),
    articlePushImage: ArticleTC.getResolver('pushToArray')
};

export {
    ArticleQuery,
    ArticleMutation,
    ArticleViewerQuery,
    ArticleDemoQuery,
};