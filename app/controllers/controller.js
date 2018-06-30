const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

const request = require('request');
const moment = require('moment');

const constantMessages = require('../helping_scripts/constantsMessages');
const userBroker = require('../dbBroker/userBroker');

let userInfo;
let messageDelay = 0;

exports.test = (req, res, next) => {
    console.log('Heroku');
    res.send('Heroku');
};

exports.getWebhook = (req, res, next) => {

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }
    else {
        res.send('no entry');
    }
};

exports.postWebhook = (req, res, next) => {

    let body = req.body;

    if (body.object === 'page') {

        console.log('trying to post');

        body.entry.forEach(function (entry) {

            let webhook_event = entry.messaging[0];

            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');

    } else {
        res.sendStatus(404);
    }

    function handleMessage(sender_psid, received_message) {
        let response;

        if (received_message.text) {

            console.log("TEXT: " + received_message.text);

            if (constantMessages.isStart(received_message.text)) {

                response = {
                    "text": "This is your menu. You can reach it by writing Menu/Help or Start 🙂",
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "About Water Bot",
                            "payload": "ABOUT_WATER_BOT",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Change Alerts",
                            "payload": "CHANGE_ALERTS",
                            "image_url": ""
                        }
                    ]
                };

                userBroker.createUser(sender_psid);
                sendTextMessage(sender_psid, response);
            }
            else if (constantMessages.isAbout(received_message.text)) {
                response = { "text": "WaterBot's goal is to help you drink more water for a healthier life." };
                sendTextMessage(sender_psid, response);
            }
            else if (constantMessages.isAlarm(received_message.text)) {
                response = {
                    "text": "How often do you want to be reminded?",
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "Every half hour",
                            "payload": "Every half hour",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Twice a day",
                            "payload": "Twice a day",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Stop reminders",
                            "payload": "Stop reminders",
                            "image_url": ""
                        }
                    ]
                };
                sendTextMessage(sender_psid, response);
            }
            else if (constantMessages.isEveryHalfHour(received_message.text)) {
                userBroker.updateUser(sender_psid, 0);

                setReminder(sender_psid, 1);
            }
            else if (constantMessages.isTwice(received_message.text)) {
                userBroker.updateUser(sender_psid, 12);

                setReminder(sender_psid, 24);
            }
            else if (constantMessages.isStopReminders()) {
                response = { "text": "You can always turn reminders on by typing Start and then selecting Change Alerts :)" };
                sendTextMessage(sender_psid, response);
            }
            else {
                response = { "text": `Sorry "${userInfo.first_name}"! I am a simple bot that is still learning. Type Start to start over` };
                sendTextMessage(sender_psid, response);
            }
        } else if (received_message.attachments) {

            let attachment_url = received_message.attachments[0].payload.url;
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Is this the right picture?",
                            "subtitle": "Tap a button to answer.",
                            "image_url": attachment_url,
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Yes!",
                                    "payload": "yes",
                                },
                                {
                                    "type": "postback",
                                    "title": "No!",
                                    "payload": "no",
                                }
                            ],
                        }]
                    }
                }
            };
            sendTextMessage(sender_psid, response);
        }
    }


    function handlePostback(sender_psid, received_postback) {
        let response;

        let payload = received_postback.payload;
        console.log('recieved Postback: ' + payload);

        if (constantMessages.isFirstMessage(payload)) {

            console.log("First message");

            request({
                "uri": 'https://graph.facebook.com/v2.6/' + sender_psid + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + ACCESS_TOKEN,
                "method": "GET",
            }, (error, res, body) => {
                if (!error && res.statusCode == 200) {

                    userInfo = JSON.parse(body);

                    response = { "text": `Hi "${userInfo.first_name}"! I will be your personal water trainer :) you can call me Nada Macura` };
                    sendTextMessage(sender_psid, response);

                    response = {
                        "text": "What I can do for you?\n\n☑️ Daily water reminders\n☑️ Personalized AI recommendations\n☑️ Number of cups of water drank this week\n☑️Tips about water drinking️️",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Start",
                                "payload": "START_REPLY_PAYLOAD",
                                "image_url": "https://dl1.cbsistatic.com/i/r/2017/11/18/4c93abd9-ea62-4472-88a7-4c8e96b743b5/thumbnail/64x64/b6aab64adbe65584fa2c7d3c9926a030/imgingest-2115643574369400691.png"
                            }
                        ]
                    };
                    sendTextMessage(sender_psid, response);

                    userBroker.createUser(sender_psid);
                }
                else {
                    console.log('Error: ' + error);
                }
            });
        }
        else if (constantMessages.hasDrank(payload)) {
            if (constantMessages.hasDrankLittle(payload)) {
                response = {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": "https://cdn.britannica.com/700x450/10/152310-004-AE62B6B8.jpg",
                            "is_reusable": true
                        }
                    },
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "Every half hour",
                            "payload": "Every half hour",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Twice a day",
                            "payload": "Twice a day",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "No more reminders",
                            "payload": "No more reminders",
                            "image_url": ""
                        }
                    ]
                };
            }
            else if (constantMessages.hasDrankMedium(payload)) {
                response = {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": "https://www.kurir.rs/data/images/2017/08/06/08/1255519_profimedia0344131111_ls-s.jpg",
                            "is_reusable": true
                        }
                    },
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "Every half hour",
                            "payload": "Every half hour",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Twice a day",
                            "payload": "Twice a day",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Stop reminders",
                            "payload": "Stop reminders",
                            "image_url": ""
                        }
                    ]
                };
            }
            else if (constantMessages.hasDrankLot(payload)) {
                response = {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": "https://i.imgflip.com/1uiqz4.jpg",
                            "is_reusable": true
                        }
                    },
                    "quick_replies": [
                        {
                            "content_type": "text",
                            "title": "Every half hour",
                            "payload": "Every half hour",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Twice a day",
                            "payload": "Twice a day",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Stop reminders",
                            "payload": "Stop reminders",
                            "image_url": ""
                        }
                    ]
                };
            }

            sendTextMessage(sender_psid, response);
        }

    }

    function setReminder(recipient, interval) {
        setTimeout(function () {
            checkReminder(recipient, interval);
        }, 1000 * 18 * interval);
    }

    function checkReminder(recipientId, interval) {
        userBroker.checkUserTime(recipientId, () => {
            let response;

            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Time for your water dose",
                            "subtitle": "How many glasses have you drank today?",
                            "image_url": "https://i.gifer.com/2NrY.gif",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "0-2",
                                    "payload": "0-2",
                                },
                                {
                                    "type": "postback",
                                    "title": "3-5",
                                    "payload": "3-5",
                                },
                                {
                                    "type": "postback",
                                    "title": "6+",
                                    "payload": "6+",
                                }
                            ],
                        }],
                    }
                }
            };

            sendTextMessage(recipientId, response);
            userBroker.updateUser(recipientId, interval);
        });
    }

    function sendTextMessage(recipientId, messageText) {
        setTimeout(function () {
            callSendAPI(recipientId, messageText);
        }, messageDelay++ * 1000);
    }

    function callSendAPI(sender_psid, response) {

        let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "message": response
        };

        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent! Delay is: ' + messageDelay);
                messageDelay = 0;
            } else {
                console.error("Unable to send message:" + err);
            }
        });
    }

};