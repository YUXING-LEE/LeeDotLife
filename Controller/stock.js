let request = require("request");
let cheerio = require("cheerio");
let GoogleSpreadsheet = require('google-spreadsheet');
let creds = JSON.parse(process.env.googleCreds)

let stocksDoc = new GoogleSpreadsheet(process.env.stocksDoc);
let stockListDate = new GoogleSpreadsheet(process.env.stockListDate);
let stockListDoc = new GoogleSpreadsheet(process.env.stockListDoc);

let header = ["證券代號", "證券名稱", "成交股數", "成交筆數", "成交金額", "開盤價", "最高價", "最低價", "收盤價", "漲跌", "漲跌價差", "最後揭示買價", "最後揭示買量", "最後揭示賣價", "最後揭示賣量", "本益比", "日期"];
let arr = [];
let stockList = [[], []];
let stockListLen = 0;

module.exports.climbStock = function (date, callback) {

    stocksDoc.useServiceAccountAuth(creds, function (err) {
        stockListDoc.useServiceAccountAuth(creds, function (err) {
            getStockList();
        });
    });

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
                else
                    callback(false);
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
                    addRowByIndex(i, null, sheet, objData);
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
            addRowByIndex(i, stockList[1][sheetIndex], stocksDoc, objData);
        }
    }

    function addRowByIndex(i, sheetIndex, sheet, objData) {
        let dataObj = {
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
        };

        sheetIndex ? sheet.addRow(sheetIndex, dataObj, function (err) {
            if (err) {
                console.log(err);
            }
            checkDataLen(i)
        }) :
            sheet.addRow(dataObj, function (err) {
                if (err) {
                    console.log(err);
                }
                checkDataLen(i)
            });
    }

    function checkDataLen(i) {
        i++;
        if (i < arr.length) {
            createSheet(i, arr[i])
        }
        else {
            stockListDate.useServiceAccountAuth(creds, function (err) {
                stockListDate.addRow(1, {
                    "date": date
                }, function (err) {
                    callback(true);
                });
            });
        }
    }
}

module.exports.checkDate = function (date, callback) {
    let flag = false;
    stockListDate.useServiceAccountAuth(creds, function (err) {
        stockListDate.getRows(1, function (err, rows) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i]["date"] == date) {
                    flag = true;
                }
            }
            callback(flag);
        });
    });
}
