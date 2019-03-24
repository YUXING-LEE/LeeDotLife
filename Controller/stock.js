let request = require("request");
let cheerio = require("cheerio");
let creds = require('../const/lee-project-f30a03754bf5.json');
let GoogleSpreadsheet = require('google-spreadsheet');

let stocksDoc = new GoogleSpreadsheet('1E7c50RxJwWcEEd3_MJvIO2Ofi0MdHTDUKPZ0ctxL_bo');
let stockListDoc = new GoogleSpreadsheet('19CuAslRE8J6tBkfj3VpCSp6OxMWeNi8z4O8nOdORLb0');

let header = ["證券代號", "證券名稱", "成交股數", "成交筆數", "成交金額", "開盤價", "最高價", "最低價", "收盤價", "漲跌", "漲跌價差", "最後揭示買價", "最後揭示買量", "最後揭示賣價", "最後揭示賣量", "本益比", "日期"];
let arr = [];
let stockList = [[], []];
let stockListLen = 0;
let date = "";

module.exports.saveToday = function (userLocation, callback) {
    auth();
}

module.exports.checkDate = function (date, callback) {
    stockListDate.useServiceAccountAuth(creds, function (err) {
        stockListDate.getRows(1, function (err, rows) {
            for (let i = 0; i < rows.length; i++) {
                if(rows[i]["date"] == date)
                    callback(true);
            }
            callback(false);
        });
    });
}

function auth() {
    stocksDoc.useServiceAccountAuth(creds, function (err) {
        stockListDoc.useServiceAccountAuth(creds, function (err) {
            getStockList();
        });
    });
}

function getStockList() {
    stockListDoc.getRows(1, function (err, rows) {
        for (let i = 0; i < rows.length; i++) {
            stockList[0].push(rows[i]["證券代號"]);
            stockList[1].push(rows[i]["index"]);
        }
        stockListLen = stockList[1].length + 1;
        getStock();
    });
}

function getStock() {
    let today = new Date();
    date = today.getFullYear() + "" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "" + (today.getDate() < 10 ? "0" + today.getDate() : today.getDate());

    date = "20190308";

    request({
        url: "http://www.twse.com.tw/exchangeReport/MI_INDEX?date=" + date + "&type=ALL",
        method: "POST"
    },
        function (err, res, body) {
            if (err || !body) { return; }
            let data = cheerio.load(body);
            let obj = JSON.parse(data.text());
            let flag = false;
            if (obj["data5"]) {
                for (let i = 0; i < obj["data5"].length; i++) {
                    if (obj["data5"][i][0] == "1102")
                        flag = true;
                    if (flag)
                        arr.push(obj["data5"][i]);
                }
                createSheet(0, arr[0]);
            }
        });
}

function createSheet(i, objData) {
    let sheetIndex = stockList[0].findIndex(name => name == objData[0]);
    if (sheetIndex == -1) {
        stockListDoc.addRow(1, {
            "證券代號": objData[0],
            "證券名稱": objData[1],
            "index": stockListLen
        }, function () {
            console.log(stockListLen)
            stockListLen += 1;
            stocksDoc.addWorksheet({
                title: objData[0] + " " + objData[1],
                headers: header,
                rowCount: 1,
                colCount: 16
            }, function (err, sheet) {
                sheet.addRow({
                    "證券代號": objData[0],
                    "證券名稱": objData[1],
                    "成交股數": objData[2],
                    "成交筆數": objData[3],
                    "成交金額": objData[4],
                    "開盤價": objData[5],
                    "最高價": objData[6],
                    "最低價": objData[7],
                    "收盤價": objData[8],
                    "漲跌": "'" + objData[9].split("<")[0],
                    "漲跌價差": objData[10],
                    "最後揭示買價": objData[11],
                    "最後揭示買量": objData[12],
                    "最後揭示賣價": objData[13],
                    "最後揭示賣量": objData[14],
                    "本益比": objData[15],
                    "日期": date
                }, function (err) {
                    i++;
                    if (i < arr.length) {
                        createSheet(i, arr[i])
                    }
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    }
    else
        add(i, objData);
}

function add(i, objData) {
    if (objData) {
        let sheetIndex = stockList[0].findIndex(name => name == objData[0]);
        console.log(stockList[1][sheetIndex]);
        stocksDoc.addRow(stockList[1][sheetIndex], {
            "證券代號": objData[0],
            "證券名稱": objData[1],
            "成交股數": objData[2],
            "成交筆數": objData[3],
            "成交金額": objData[4],
            "開盤價": objData[5],
            "最高價": objData[6],
            "最低價": objData[7],
            "收盤價": objData[8],
            "漲跌": "'" + objData[9].split("<")[0],
            "漲跌價差": objData[10],
            "最後揭示買價": objData[11],
            "最後揭示買量": objData[12],
            "最後揭示賣價": objData[13],
            "最後揭示賣量": objData[14],
            "本益比": objData[15],
            "日期": date
        }, function (err) {
            i++;
            if (i < arr.length) {
                createSheet(i, arr[i])
            }
            if (err) {
                console.log(err);
            }
        });
    }
}