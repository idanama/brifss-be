import apolloClient from '.././utils/apolloClient';
import gql from 'graphql-tag';
import dotenv from 'dotenv';

import RSSParser from "rss-parser";

import mongoose from 'mongoose';

import findArticleImage from './fetchImages';

dotenv.config();

const parser = new RSSParser();

// get source Rss Feed

// eslint-disable-next-line
const parseRss = (rss) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
        parser.parseURL(rss, function (err, rssFeed) {
            if (!err) {
                // console.log(rss);
                resolve(rssFeed);
            } else {
                reject(err);
            }
        });
    });
};

// iterate source articles
// if not already in db add to db


// add to db

const insertArticlesIntoDB = (articles, sourceId, sourceName) => {
    // let newArticles = 0;
    articles.forEach((element) => {
        // console.log(element.link);

        apolloClient.query({
            query: gql `
            query articleOne($link:String)
             {
                articleOne(filter:{link:$link}){
                    _id
                }
            }
            `,
            variables: {
                link: element.link
            }
        }).then(response => {

            if (response.data.articleOne === null) {
                // console.log(response);
                console.log(`${sourceName}: ${element.title}`);
                if (element.contentSnippet === undefined && element.content !== undefined) {
                    element.contentSnippet = element.content;
                }
                if (element.contentSnippet === undefined && element.description !== undefined) {
                    element.contentSnippet = element.description;
                }
                // newArticles++;
                let date = new Date();
                if (element.isoDate !== undefined) {
                    date = new Date(element.isoDate);
                } else if (element.date !== undefined) {
                    date = new Date(element.date);
                }
                if (element.title.length > 0 && element.link.length > 0) {
                    apolloClient.mutate({
                        mutation: gql `
                            mutation articleCreateOne($sourceId:MongoID!,$link:String!,$title:String!,$content:String,$contentSnippet:String,$date:String)
                            {
                                articleCreateOne(record:{source:$sourceId,link:$link, title:$title,content:$content,contentSnippet:$contentSnippet,date:$date}){
                                    record{
                                        source{
                                            _id
                                        }
                                        title
                                        link
                                        content
                                        contentSnippet
                                        date
                                        _id
                                    }
                                }
                            }
                        `,
                        variables: {
                            sourceId,
                            title: element.title,
                            link: element.link,
                            content: element.content,
                            contentSnippet: element.contentSnippet,
                            date
                        }
                    }).then(response => {
                        // console.log(response.data.articleCreateOne.record._id);
                        // console.log(mongoose.Types.ObjectId(response.data.articleCreateOne.record._id));

                        findArticleImage(mongoose.Types.ObjectId(response.data.articleCreateOne.record._id));
                    }).catch(error => {
                        console.log(`Error in ${sourceName}:`);
                        console.log(element);
                        console.error(error);
                    });
                }

            }
        }).catch(error => {
            console.log(`Error in ${sourceName}:`);
            console.log(element);
            console.error(error);
        });

    });
    // console.log(`${sourceName}:${newArticles}`);


};

const getNewArticles = (source) => {
    parseRss(source.rss)
        .then(feedItems => {
            // console.log(feedItems);
            insertArticlesIntoDB(feedItems.items, source._id, source.name);
        }).catch(error => {
            console.log(`${source.name}: couldn't get rss feed`);
            console.error(error);
        });
};

const fetchArticles = () => {
    console.log("Fetching new articles");
    // get article rss list from apollo
    apolloClient.query({
            query: gql `
             {
                sourceMany(limit:null){
                    rss
                    name
                    category
                    locale
                    rtl
                    _id
                }
            }
            `,
        })
        .then(data => {
            data.data.sourceMany.forEach(source => {
                // console.log(`updating ${source.name}`);
                getNewArticles(source);
            });
        })
        .catch(error => console.error(error));
};


// Update RSS data every 5 minutes
if (process.env.NODE_ENV !== 'development') {
    fetchArticles();
    console.log(process.env.NODE_ENV);
    setInterval(() => {
        fetchArticles();
    }, 300000);
} else {
    console.log(`NODE_ENV=${process.env.NODE_ENV} : not fetching RSS`);
}