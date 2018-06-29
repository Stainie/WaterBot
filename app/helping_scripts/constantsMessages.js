exports.isStart = (text) => {
    return text.toLowerCase() === "start" || text.toLowerCase() === "menu" || text.toLowerCase() === "help";
};

exports.isAbout = (text) => {
    return text.toLowerCase() === "about water bot";
};

exports.isAlarm = (text) => {
    return text.toLowerCase() === "change alerts";
};

exports.isFirstMessage = (text) => {
    return text === "GET_STARTED_PAYLOAD";
};

exports.isEveryHour = (text) => {
    return text.toLowerCase() === "every hour";
};

exports.isTwice = (text) => {
    return text.toLowerCase() === "twice a day";
};

exports.isStopReminders = (text) => {
    return text.toLowerCase() === "stop reminders";
};