module.exports = {
    url: 'mongodb://stainie:'
    + process.env.MONGO_CONNECT_PW
    + '@waterbotcluster-shard-00-00-xhr3l.mongodb.net:27017,waterbotcluster-shard-00-01-xhr3l.mongodb.net:27017,waterbotcluster-shard-00-02-xhr3l.mongodb.net:27017/test?ssl=true&replicaSet=WaterBotCluster-shard-0&authSource=admin&retryWrites=true'
};