window.onload = function () {
    const histories = getHistory();
    const workingMinutes = calcWorkingMinutes(histories);
    const autoAddedBreak = calcAutoAddedBreak(workingMinutes);
    setWorkingHours(formatMinutes(workingMinutes - autoAddedBreak), formatMinutes(autoAddedBreak));
};

function History(type, time) {
    this.type = type;
    this.time = time;
}

function getHistory() {
    const historyList = document.getElementsByClassName("history-list")[0];
    const historyItems = historyList.getElementsByClassName("history-item");

    const descHistories = Array.from(historyItems).map(function (historyItem) {
        // 「退勤12:34」のような文字列を「退勤」と「12:34」に分割する
        const textContent = historyItem.textContent;
        const splitIndex = textContent.search(/\d/);
        const type = textContent.slice(0, splitIndex);
        const timeString = textContent.slice(splitIndex);

        const timeParts = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(timeParts[0], 10));
        date.setMinutes(parseInt(timeParts[1], 10));
        date.setSeconds(0);

        const history = new History(type, date);
        return history;
    });

    const histories = descHistories.sort(function (a, b) { return a.time - b.time; });
    return histories;
}

function calcWorkingMinutes(histories) {
    if (histories.length == 0) {
        return 0;
    }

    const workStart = histories[0].time;
    const lastHistory = histories[histories.length - 1];
    const workEnd = lastHistory.type === "退勤" ? lastHistory.time : new Date();

    let workingMilliSeconds = workEnd - workStart;
    let breakStart = null;
    let breakEnd = null;

    for (const history of histories) {
        if (history.type === "休憩開始") {
            breakStart = history.time;
        } else if (history.type === "休憩終了") {
            breakEnd = history.time;
            workingMilliSeconds -= (breakEnd - breakStart);
            breakStart = null;
            breakEnd = null;
        }
    }

    return Math.floor(workingMilliSeconds / 60000);
}

function calcAutoAddedBreak(workingMinutes) {
    if (workingMinutes >= 480) {
        return 60;
    } else if (workingMinutes >= 360) {
        return 45;
    } else {
        return 0;
    }
}

function formatMinutes(minutes) {
    return Math.floor(minutes / 60) + "時間" + (minutes % 60) + "分";
}

function setWorkingHours(workingHoursText, autoAddedBreakText) {
    var statusContainer = document.getElementsByClassName("status-container")[0];

    var workingHoursContainer = document.createElement("div");
    workingHoursContainer.className = "working-hours-container";
    statusContainer.appendChild(workingHoursContainer);

    var workingHours = document.createElement("span");
    workingHours.className = "workingHours";
    workingHoursContainer.appendChild(workingHours);

    workingHours.innerHTML = `勤務時間：${workingHoursText}（自動追加休憩時間：${autoAddedBreakText}）`;
}
