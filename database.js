const mongoose = require('mongoose');

/*These settings are no more required. Actually they will cause crash.
    mongoose.set('setNewUrlParser', true);
    mongoose.set('useUnifiedToplogy', true);
    mongoose.set('useFindAndModify', false);
*/
class Database {
    constructor() {
        this.connect();
    }

    connect() {
        const connectionString = 'mongodb+srv://fxh:caseolin406@twitterclonecluster.bv9s9.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority';
        mongoose.connect(connectionString)
                .then(() => {
                    console.log('DB connection successful.')
                })
                .catch((error)=> {
                    console.log('DB conneciton error: ' + error);
                });
    }
}

module.exports = new Database();