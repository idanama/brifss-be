import {
    Source,
    SourceTC
} from '../models/source';

const SourceQuery = {
    sourceById: SourceTC.getResolver('findById'),
    sourceByIds: SourceTC.getResolver('findByIds'),
    sourceOne: SourceTC.getResolver('findOne'),
    sourceMany: SourceTC.getResolver('findMany'),
    sourceCount: SourceTC.getResolver('count'),
    sourceConnection: SourceTC.getResolver('connection'),
    sourcePagination: SourceTC.getResolver('pagination'),
};

const SourceMutation = {
    sourceCreateOne: SourceTC.getResolver('createOne'),
    sourceCreateMany: SourceTC.getResolver('createMany'),
    sourceUpdateById: SourceTC.getResolver('updateById'),
    sourceUpdateOne: SourceTC.getResolver('updateOne'),
    sourceUpdateMany: SourceTC.getResolver('updateMany'),
    sourceRemoveById: SourceTC.getResolver('removeById'),
    sourceRemoveOne: SourceTC.getResolver('removeOne'),
    sourceRemoveMany: SourceTC.getResolver('removeMany'),
};

export {
    SourceQuery,
    SourceMutation
};