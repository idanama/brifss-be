import mongoose, {
    Schema
} from 'mongoose';
import timestamps from 'mongoose-timestamp';
import {
    composeWithMongoose
} from 'graphql-compose-mongoose';

export const SourceSchema = new Schema({
    rss: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    rtl: {
        type: Boolean,
    },
    category: {
        type: String,
        trim: true
    },
    locale: {
        type: String,
        trim: true
    }
}, {
    collection: 'sources',
});

SourceSchema.plugin(timestamps);

SourceSchema.index({
    createdAt: 1,
    updatedAt: 1
});

export const Source = mongoose.model('Source', SourceSchema);
export const SourceTC = composeWithMongoose(Source);