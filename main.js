const linebot = require('linebot');
const express = require('express');
const locationList = require('./const/location');
const Iuser = require('./Model/user');
const user_function = require('./Controller/user');
const weather_function = require('./Controller/weather');
const stock_function = require('./Controller/stock');

const bot = linebot({
    channelId: process.env.ChannelId,
    channelSecret: process.env.ChannelSecret,
    channelAccessToken: process.env.ChannelAccessToken
    //channelId: '1622427338',
    //channelSecret: 'c20b7ab62279f5904d5fb587395dd204',
    //channelAccessToken: 'XiabDQgL9f4DYoKW40cVOERtvMgZcBwHtpxzUwrYHZTM27HCL6/LtNK5SCCgp5yO1cIzR9Zh0podUy4BUzsOHI9AhW51bvMajDTfT+7t+zVHIbx1/j9xiNCihk/+uuI5AVw+t1nkyaEClxfq0+v+8gdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function (event) {
    user_function.accountCheck(event.source.userId, function(accountCheck) {
        if (accountCheck && event.message.type == "text") {
            let message = event.message.text.trim().toLowerCase().split(/\s+/);
            console.log("message: ", message)
            console.log("message[0].trim().toLowerCase(): ", message[0].trim().toLowerCase())
            console.log("message[1]: ", message[1])
            switch (message[0].trim().toLowerCase()) {
                case "weather":
                    user_function.getLocation(event.source.userId, function(location){
                        weather_function.now(locationList[location], function(weather) {
                            event.reply(weather);
                        });
                    });
                    break;
                case "air":
                    user_function.getLocation(event.source.userId, function (location) {
                        weather_function.air(location, function (air) {
                            console.log(air);
                            event.reply("OK");
                        });
                    });
                    break;
                case "getstock":
                    stock_function.checkDate(message[1], function (check) {
                        if(check)
                            event.reply("Already Save");
                        else
                            event.reply("NOOO!!!");
                    });
                    break;
                case "delete account":
                    user_function.delete(event.source.userId, function(message){
                        event.reply(message);
                    });
                    break;
                default: event.reply("無此功能\n麻煩請找李昱興");
            }
        }
        if (accountCheck && event.message.type == "sticker") {
            event.reply("可愛");
        }
        if (!accountCheck) {
            let message = event.message.text.trim().toLowerCase().split(/\s+/);
            switch(message[0]){
                case "create":
                    if (message[1] == null || message[2] == null) {
                        event.reply("帳號或地址有錯");
                        break;
                    }
                    let userObj = new Iuser(event.source.userId, message[1], message[2]);
                    user_function.signup(userObj, function(accountCheck) {
                        if(accountCheck) event.reply("歡迎加入<3");
                        else event.reply("您已經創立過帳號");
                    });
                    break;
                default: event.reply("尚未註冊\n透過create name location建立\nEX:create 王大明 台北");
            }
        };
    });
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log("App now running on port", port);
});

