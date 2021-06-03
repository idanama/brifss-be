const userPermissions = (user) => {

    let isAuthenticated = false;
    let canReadAnyAccount = false;
    let canReadOwnAccount = false;
    let canWriteArticles = false;
    let canWriteSources = false;

    if (user && user["https://brifss.com/graphql"]) {
        // return user["https://brifss.com/graphql"].permissions;
        isAuthenticated = true;
        if (user["https://brifss.com/graphql"].permissions.includes("read:any_account")) {
            canReadAnyAccount = true;
        }
        if (user["https://brifss.com/graphql"].permissions.includes("read:own_account")) {
            canReadOwnAccount = true;
        }
        if (user["https://brifss.com/graphql"].permissions.includes("write:articles")) {
            canWriteArticles = true;
        }
        if (user["https://brifss.com/graphql"].permissions.includes("write:sources")) {
            canWriteSources = true;
        }
    }
    const permissions = {
        viewer: isAuthenticated,
        account: (canReadOwnAccount || canReadAnyAccount),
        admin: canReadAnyAccount,
        writer: (canWriteSources && canWriteArticles)
    };
    return permissions;
};

export {
    userPermissions
};