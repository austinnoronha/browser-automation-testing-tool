/* @name: Server - API for Broswer Automation
 * @desc: Server Automation Tool
 * @date: 12/02/2021
 * @issues: 
 * 1. Code works for windows chrome browser, but need to debug why its not working for firefox
 * 2. Firefox browser its not able to kill the instance
 */
var express = require("express");
const url = require('url');    
var app = express();
var cp = require('child_process');

const APP_PORT = 3000;
const OS_TYPE = require('os').type();
const OS_PLATFORM = require('os').platform();
const REMOTE_DEBUGGING_PORT = 9523;
const APP_CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const APP_FIREFOX_PATH = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
const APP_BROWSER_USER_DIR = 'C:\\Users\\<___USER___>\\Downloads\\BrowserInstanceTestingData';
let APP_BROWSER_INSTANCE_COUNT = 1;

var browserInstances = [];
var lastInstance = '';

function appDebug(msg, err){
    var tmp = `[APP] ${Date().toString()}: ` + msg;
    if(err && err === 1){
        console.error(tmp);
    }else{
        console.log(tmp);
    }
}

function throwError(res, api, error){
    res.status(500).send(`[API: ${api}] - ${error}`);
}

function displayHTML(res, body){
    res.type('html');             
    res.send(body);
}

function startNewBrowserInstance(browser,url,id,callback){
	try{
        appDebug(`Terminal browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, start: triggered`);

        var terminal = cp.spawn( (OS_PLATFORM === 'win32' ? 'cmd':'bash') );
        var browserInstance = {};
        var browserPath = browser === 'chrome' ? APP_CHROME_PATH : APP_FIREFOX_PATH;

        terminal.on('exit', function (code) {
            appDebug(`Starting browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, code: ${code}`);

            browserInstance = cp.spawn(browserPath,[
                '--remote-debugging-port='+REMOTE_DEBUGGING_PORT,
                '--user-data-dir='+APP_BROWSER_USER_DIR+'\\userdata_'+browser,
                url
            ]);

            callback(null,browser,url,id,browserInstance);
        });

        setTimeout(function() {
            appDebug(`Terminal browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, create_new_dir: userdata_${browser}`);
            terminal.stdin.write('rmdir /s '+APP_BROWSER_USER_DIR+'\\userdata_'+browser+'\n');
            terminal.stdin.write('mkdir '+APP_BROWSER_USER_DIR+'\\userdata_'+browser+'\n');
            terminal.stdin.end();
            appDebug(`Terminal browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, end: triggered`);
        }, 1000);
    }
    catch(e){
        console.log(e);
    }	
}

function cleanupBrowserInstance(browser,callback){
	try{
        appDebug(`Terminal clean browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, start: triggered`);

        var terminal = cp.spawn( (OS_PLATFORM === 'win32' ? 'cmd':'bash') );
        
        terminal.on('exit', function (code) {
            callback(null);
        });

        setTimeout(function() {
            appDebug(`Terminal clean browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, create_new_dir: userdata_${browser}`);
            terminal.stdin.write('rmdir /Q /S '+APP_BROWSER_USER_DIR+'\\userdata_'+browser+'\n');
            //terminal.stdin.write('mkdir '+APP_BROWSER_USER_DIR+'\\userdata_'+browser+'\n');
            terminal.stdin.end();
            appDebug(`Terminal clean browser: ${browser}, OS_PLATFORM: ${OS_PLATFORM}, end: triggered`);
        }, 1000);
    }
    catch(e){
        console.log(e);
    }	
}

app.get('/', function (req, res) {

    var tmp = "Method  |  Endpoint  |  Parameter(s)"+"<br>";
    tmp += "GET  |  /start  |  browser, url"+"<br>";
    tmp += "GET  |  /stop  |  browser"+"<br>";
    tmp += "GET  |  /cleanup  |  browser"+"<br>";
    tmp += "GET  |  /geturl  |  browser"+"<br>";

    tmp += "<br><br><br>Please setup the following variables in APP:<br>const APP_CHROME_PATH = 'C:\\.....\chrome.exe';<br>const APP_FIREFOX_PATH = 'C:\\......\\firefox.exe';<br>const APP_BROWSER_USER_DIR = 'C:\\Users\\<USER>\\Downloads\\BrowserInstanceTestingData';";
    res.send('Sorry your have reached the wrong place!<br><br><br>APIs<br>'+tmp);
});

app.get('/start', function (req, res) {
    let { browser, url } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;
    let isValidURL = true;
    
    try {
        const myURL = new URL(url);
    } catch (e) {
        appDebug(`[API: /start] Exception ${e.input}`);
        isValidURL = false;
    }

    if(!isValidBrowser){
        throwError(res, 'start', 'browser should be chrome or firefox');
        return;
    }
    if(!isValidURL){
        throwError(res, 'start', 'url is invalid, please send valid url');
        return;
    }
    
    try{
        const callBack = function(err,browser,url,id,browserInstance){
            browserInstances.push({
                browser: browser,
                url: url,
                id: id,
                pid: browserInstance.pid,
                child: browserInstance
            });
            lastInstance = url;

            displayHTML(res, `Successfully loaded (No. ${id}) ${browser} - url ${url} & pid: ${browserInstance.pid}`);
        }

        startNewBrowserInstance(browser, url, APP_BROWSER_INSTANCE_COUNT++, callBack);
    }
    catch(e){
        appDebug(`[API: /start] Exception ${e.getMessage()}`);
        throwError(res, 'start', 'some error occurred');
    }
    
});

app.get('/geturl', function (req, res) {
    let { browser } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;

    if(!isValidBrowser){
        throwError(res, 'geturl', 'browser should be chrome or firefox');
        return;
    }

    //var instances = browserInstances[browser] || null;
    if(lastInstance.length > 0){
        displayHTML(res, `Successfully opened "${lastInstance}" instance of ${browser}`);
    }
    
});

app.get('/stop', function (req, res) {
    let { browser } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;

    if(!isValidBrowser){
        throwError(res, 'stop', 'browser should be chrome or firefox');
        return;
    }

    var instances = browserInstances.filter(function(item) {
        return item.browser === browser;
    });

    var countInstances = instances != null ? instances.length : 0;
    appDebug(`[API: /stop] Shutting down (${countInstances}) of ${browser} browser`);

    if(countInstances > 0){
        instances.map((item, idx, orgArr) => {
            var {browser, url, id, child, pid} = item;
            try{
                appDebug(`[API: /stop] Shutdown down (${id}) ${browser} - url ${url} & pid: ${child.pid}`);
                child.kill();
                APP_BROWSER_INSTANCE_COUNT--;

                let removeIndex = browserInstances.map((item) => item.pid).indexOf(pid);
                browserInstances.splice(removeIndex, 1);
            }
            catch(e){
                appDebug(`[API: /stop] Exception ${e.toString()}`);
            }
        });

        displayHTML(res, `Successfully stopped ${browser} total browserInstances: ${browserInstances.length}`);
    }
    else{
        displayHTML(res, `Browser "${browser}" has no instances running...`);
    }
});



app.get('/cleanup', function (req, res) {
    let { browser } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;

    if(!isValidBrowser){
        throwError(res, 'cleanup', 'browser should be chrome or firefox');
        return;
    }

    var instances = browserInstances.filter(function(item) {
        return item.browser === browser;
    });

    var countInstances = instances != null ? instances.length : 0;
    appDebug(`[API: /cleanup] Shutting down (${countInstances}) of ${browser} browser`);

    if(countInstances === 0){
        try{
            cleanupBrowserInstance(browser, function callback(){
                displayHTML(res, `Successfully cleaned "${browser}" userdata`);
            });
        }
        catch(e){
            appDebug(`[API: /cleanup] Exception ${e.toString()}`);
        }
        
    }
    else{
        displayHTML(res, `Browser "${browser}" has ${countInstances} instances running, please stop them and then run cleanup...`);
    }
});



app.listen(APP_PORT, () => {
 console.log(`[APP] ${Date().toString()}: Server running on port: ${APP_PORT} , ostype: ${OS_TYPE}`);
});