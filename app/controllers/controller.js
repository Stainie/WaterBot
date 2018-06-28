const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

const request = require('request');
const constantMessages = require('../helping_scripts/constantsMessages');

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
                            "title": "Every Hour",
                            "payload": "EVERY_HOUR",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Twice a day",
                            "payload": "TWICE_A_DAY",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Once a day",
                            "payload": "ONCE_A_DAY",
                            "image_url": ""
                        },
                        {
                            "content_type": "text",
                            "title": "Stop Reminders",
                            "payload": "STOP_REMINDERS",
                            "image_url": ""
                        }
                    ]
                };
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

        if (constantMessages.isFirstMessage(payload)) {

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
                }
                else {
                    console.log('Error: ' + error);
                }
            });
        }
    }

    function sendTextMessage(recipientId, messageText) {
          setTimeout(function() {
            callSendAPI(recipientId, messageText);
          }, messageDelay++ * 100);    
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