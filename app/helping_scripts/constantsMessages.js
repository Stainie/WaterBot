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
    return text === "USER_DEFINED_PAYLOAD";
};

exports.isEveryHalfHour = (text) => {
    return text.toLowerCase() === "every half hour";
};

exports.isTwice = (text) => {
    return text.toLowerCase() === "twice a day";
};

exports.isStopReminders = (text) => {
    return text.toLowerCase() === "stop reminders";
};

exports.hasDrank = (payload) => {
    return payload.toLowerCase() === "0-2" || payload.toLowerCase() === "3-5" || payload.toLowerCase() === "6+";
};

exports.hasDrankLittle = (payload) => {
    return payload.toLowerCase() === "0-2";
};

exports.hasDrankMedium = (payload) => {
    return payload.toLowerCase() === "3-5";
};

exports.hasDrankLot = (payload) => {
    return payload.toLowerCase() === "6+";
};