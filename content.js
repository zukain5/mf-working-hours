window.onload = function () {
    const histories = getHistory();
    const duration = calcDuration(histories);
    setDuration(formatDuration(duration));
};

function History(type, time) {
    this.type = type;
    this.time = time;
}

function getHistory() {
    const historyList = document.getElementsByClassName("history-list")[0];
    const historyItems = historyList.getElementsByClassName("history-item");

    const descHistories = Array.from(historyItems).map(function (historyItem) {
        const textContent = historyItem.textContent.trim().split('\n').map(item => item.trim());
        const type = textContent[0];
        const timeString = textContent[1];

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

function calcDuration(histories) {
    if (histories.length == 0) {
        return 0;
    }

    const workStart = histories[0].time;
    const lastHistory = histories[histories.length - 1];
    const workEnd = lastHistory.type === "退勤" ? lastHistory.time : new Date();

    let duration = workEnd - workStart;
    let breakStart = null;
    let breakEnd = null;

    for (const history of histories) {
        if (history.type === "休憩開始") {
            breakStart = history.time;
        } else if (history.type === "休憩終了") {
            breakEnd = history.time;
            duration -= (breakEnd - breakStart);
            breakStart = null;
            breakEnd = null;
        }
    }

    return Math.floor(duration / 60000);
}

function formatDuration(duration) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return "勤務時間：" + hours + "時間" + minutes + "分";
}

function setDuration(text) {
    var statusContainer = document.getElementsByClassName("status-container")[0];

    var durationContainer = document.createElement("div");
    durationContainer.className = "duration-container";
    statusContainer.appendChild(durationContainer);

    var duration = document.createElement("span");
    duration.className = "duration";
    durationContainer.appendChild(duration);

    duration.innerHTML = text;
}
