import apolloClient from '.././utils/apolloClient';
import gql from 'graphql-tag';
import mongoose from 'mongoose';
import {
    response
} from 'express';

import fetch from 'node-fetch';
import {
    JSDOM
} from 'jsdom';

// findImgSrc -> search image src tag 
const findImgSrc = (div) => {
    const regex = /<img.*?src='(.*?)'/;
    const result = regex.exec(div);
    if (result !== null) {
        return result[1];
    } else return undefined;
};

const pushImageUrl = (_id, imageUrl) => {
    apolloClient.mutate({
        mutation: gql `
            mutation articlePushImage($_id:MongoID!,$imageUrl:String!)
            {
                articlePushImage(_id:$_id,imageUrl:$imageUrl){
                    _id
                    imageUrl
                }
            }
        `,
        variables: {
            _id: _id,
            imageUrl: imageUrl,
        }
    }).catch((err => console.error(err)));

}

// findArticleImage -> get db id and find an image for it
const findArticleImage = (_id) => {
    apolloClient.query({
        query: gql `
        query articleOne($_id:MongoID)
         {
            articleOne(filter:{_id:$_id}){
                _id
                content
                link
            }
        }
        `,
        variables: {
            _id
        }
    }).then(response => {
        // add image from meta tags
        // only after that search for image in content
        const article = response.data.articleOne;
        JSDOM.fromURL(article.link).then(dom => {
            // console.log(dom.serialize());
            const headEls = (dom.window.document.head.children);
            Array.from(headEls).map(v => {
                const prop = v.getAttribute('property')
                // if (!prop) console.log("not found");;
                if (prop === "og:image" ||
                    prop === "twitter:image") {
                    pushImageUrl(_id, v.getAttribute("content"));
                }
            });
        }).then(() => {
            const src = findImgSrc(article.content);
            if (src !== undefined) {
                pushImageUrl(_id, src);
            }
        });
    }).catch((err) => console.error(err));
};

// const findMissingImages = async () => {
//     const query = await apolloClient.query({
//         query: gql `
//         query articleOne
//          {
//             articleMany(limit:100,filter:{imageUrl:[]}){
//                 _id
//                 content
//                 link
//                 title
//             }
//         }
//         `
//     });
//     const articleList = query.data.articleMany;
//     console.log(articleList.length);

//     for (let index = 0; index < articleList.length; index++) {
//         const response = await findArticleImage(articleList[index]._id);
//         console.log(`found for ${articleList[index].title}`);
//     }
// };


// findMissingImages();

export default findArticleImage;