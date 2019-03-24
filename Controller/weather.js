const request = require('request');
const cheerio = require('cheerio');

module.exports.now = function (userLocation, callback) {
    const url = 'https://www.cwb.gov.tw/V7/forecast/taiwan/' + userLocation + '.htm';
    request(url, (err, res, body) => {
        const $ = cheerio.load(body)
        let weathers = []
        $('.FcstBoxTable01 tbody tr').each(function (i, elem) {
            weathers.push($(this).text().split('\n'))
        });
        weathers.pop();
        weathers.pop();
        weathers = weathers.map(weather => ({
            time: weather[1].split("\t")[2],
            temp: weather[2].split("\t")[2],
            rain: weather[6].split("\t")[2],
        }));

        let replyMsg = "";
        let rainStr = "";

        for (let i = 0; i < 2; i++) {
            replyMsg += weathers[i].time + "\n溫度在" + weathers[i].temp + "之間\n下雨機率是" + weathers[i].rain;
            let rainProbability = parseInt(weathers[i].rain);
            if (rainProbability >= 50 ) {
                rainStr = "降雨機率超過50%記得帶傘!!!"
            }
            replyMsg += "\n--------\n";
        }
        if (rainStr != "") {
            replyMsg += rainStr;
        }

        callback(replyMsg);
    })
}