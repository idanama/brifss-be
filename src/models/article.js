import mongoose, {
    Schema
} from 'mongoose';
import timestamps from 'mongoose-timestamp';
import {
    composeWithMongoose
} from 'graphql-compose-mongoose';
import Date from 'graphql-compose/lib/type/date';

export const ArticleSchema = new Schema({
    source: {
        type: Schema.Types.ObjectId,
        ref: 'Source',
        required: true,
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        trim: true,
        required: true
    },
    imageUrl: [String],
    imagePlaceholder: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    contentSnippet: {
        type: String,
        trim: true
    },
    date: {
        type: String
    }
}, {
    collection: 'articles',
});

ArticleSchema.plugin(timestamps);

ArticleSchema.index({
    createdAt: 1,
    updatedAt: 1
});

export const Article = mongoose.model('Article', ArticleSchema);
export const ArticleTC = composeWithMongoose(Article);