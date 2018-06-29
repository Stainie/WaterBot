const User = require('../model/user');
const moment = require('moment');

exports.createUser = (facebookId) => {
    const user = new User({
        facebookId: facebookId,
        remindInterval: -1,
        nextReminder: moment().toDate().toISOString()
    });

    user
        .save()
        .then(result => {
            console.log('Successfully saved user: ' + result);
        })
        .catch(err => {
            console.log('Error while saving user: ' + err);
        });
};

exports.updateUser = (id, interval) => {
    let nextTime;

    if (interval === -1) {
        nextTime = moment().add(100, "years").toDate().toISOString();
    }
    else {
        nextTime = moment().add(interval, "hours").toDate().toISOString();
    }

    User.update({facebookId: id}, {
        $set: {
            remindInterval: interval,
            nextReminder: nextTime
        }
    })
        .exec()
        .then(result => {
            console.log("User successfully updated: " + result);

        })
        .catch(err => {
            console.log("Error while updating user: " + err);
        });
};

exports.getUser = (id) => {
    User.findOne({facebookId: id})
        .select('-__v')
        .exec()
        .then(doc => {
            const response = {
                facebookId: doc.facebookId,
                remindInterval: doc.remindInterval,
                nextReminder: doc.nextReminder
            };

            console.log("Successfully returned user: " + response);

            return response;
        })
        .catch(err => {
            console.log("Error while getting user: " + err);
        });
};