const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

const request = require('request');

let firstName;
let lastPayload;
let lastText;

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

    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

    function handleMessage(sender_psid, received_message) {
        let response;

        // Checks if the message contains text
        if (received_message.text) {
            if (received_message.text.toLowerCase() === "start") {
                response = { "text": "This is your menu. You can reach it by writing Menu/Help or Start 🙂" };
                callSendAPI(sender_psid, response);
                response = {
                    "text": "After Start",
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
                callSendAPI(sender_psid, response);
            }
        } else if (received_message.attachments) {
            // Get the URL of the message attachment
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
            callSendAPI(sender_psid, response);
        }
    }

    function handlePostback(sender_psid, received_postback) {
        let response;

        // Get the payload for the postback
        let payload = received_postback.payload;

        // Set the response based on the postback payload
        if (payload === 'yes') {
            response = { "text": "Thanks!" };
            callSendAPI(sender_psid, response);

        } else if (payload === 'no') {
            response = { "text": "Oops, try sending another image." };
            callSendAPI(sender_psid, response);
        }
        else if (payload === 'GET_STARTED_PAYLOAD') {

            request({
                "uri": 'https://graph.facebook.com/v2.6/' + sender_psid + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + ACCESS_TOKEN,
                "method": "GET",
            }, (error, res, body) => {
                if (!error && res.statusCode == 200) {
                    firstName = JSON.parse(body);
                    response = { "text": `Hi "${firstName.first_name}"! I will be your personal water trainer :) you can call me Nada Macura` };
                    callSendAPI(sender_psid, response);
                    response = { "text": "What I can do for you?\n\n☑️ Daily water reminders\n☑️ Personalized AI recommendations\n☑️ Number of cups of water drank this week\n☑️Tips about water drinking️️" };
                    callSendAPI(sender_psid, response);
                    response = {
                        "text": "Start",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Start",
                                "payload": "START_REPLY_PAYLOAD",
                                "image_url": "https://dl1.cbsistatic.com/i/r/2017/11/18/4c93abd9-ea62-4472-88a7-4c8e96b743b5/thumbnail/64x64/b6aab64adbe65584fa2c7d3c9926a030/imgingest-2115643574369400691.png"
                            }
                        ]
                    };
                    callSendAPI(sender_psid, response);
                }
                else {
                    console.log('Error: ' + error);
                }
            });
        }

        lastPayload = payload;
    }

    function callSendAPI(sender_psid, response) {
        // Construct the message body
        let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "message": response
        };

        // Send the HTTP request to the Messenger Platform
        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent!');
            } else {
                console.error("Unable to send message:" + err);
            }
        });
    }

};