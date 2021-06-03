import bcrypt from 'bcryptjs';
const SALT_WORK_FACTOR = 10;

import mongoose, {
    Schema
} from 'mongoose';
import timestamps from 'mongoose-timestamp';
import {
    composeWithMongoose
} from 'graphql-compose-mongoose';

export const StatSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'Article',
    },
    activity: {
        type: String
    },
    timestamp: {
        type: Date
    }
});

export const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    roles: {
        type: Array,
        trim: true,
        lowercase: true,
        default: ["subscriber"],
    },
    permissions: {
        type: Array,
        trim: true,
        lowercase: true,
        default: ["read:own_account"],
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        partialFilterExpression: {
            email: {
                $type: "string"
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    jwt: {
        type: String
    },
    stats: [StatSchema],
}, {
    collection: 'users',
});

UserSchema.plugin(timestamps);

UserSchema.index({
    createdAt: 1,
    updatedAt: 1
});

UserSchema.pre('save', function (next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// UserSchema.methods.comparePassword = function (candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };

export const User = mongoose.model('User', UserSchema);
export const UserTC = composeWithMongoose(User);