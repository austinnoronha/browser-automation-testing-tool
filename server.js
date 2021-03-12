/* @name: Server - API for Broswer Automation
 * @desc: Server Automation Tool
 * @date: 12/02/2021
 */
var express = require("express");
const url = require('url');    
var app = express();
const APP_PORT = 3000;
const OS_TYPE = require('os').type();
var { exec } = require('child_process');

var browserInstances = [];
var lastInstance = '';
function throwError(res, api, error){
    res.status(500).send(`[API: ${api}] - ${error}`);
}
function displayHTML(res, body){
    res.type('html');             
    res.send(body);
}

app.get('/', function (req, res) {
    res.send('Sorry your have reached the wrong place!')
});

app.get('/start', function (req, res) {
    let { browser, url } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;
    let isValidURL = true;
    
    try {
        const myURL = new URL(url);
    } catch (error) {
        console.log(`[APP] ${Date().toString()}: ${error.input} is not a valid url`);
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

    var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    var cmd = start + ' ' + browser + ' ' + url;
    
    try{
        var child = exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            
            displayHTML(res, `Successfully loaded ${browser} and url ${url} witdh pid: ${pid}`);
        });

        child.on('close', (code, signal) => {
            console.error(`[APP] ${Date().toString()}: child process closed code: ${code}`);
        });
        child.on('disconnect', (code, signal) => {
            console.error(`[APP] ${Date().toString()}: child process disconnected code: ${code}`);
        });
        child.on('exit', (code, signal) => {
            console.error(`[APP] ${Date().toString()}: child process exited code: ${code}`);
        });
        child.on('SIGHUP', () => {
            console.log(`[APP] ${Date().toString()}: child process Got SIGHUP signal`);
        });

        var { pid } = child;

        console.log(`[APP] ${Date().toString()}: loaded child ${pid}`);

        if(typeof browserInstances[browser] === "undefined")
            browserInstances[browser] = [];

        if(typeof browserInstances[browser][pid] === "undefined")
            browserInstances[browser][pid] = {};

        browserInstances[browser][pid] = {
            url: url,
            child: child
        };
        lastInstance = url;
    }
    catch(e){
        //throwError(res, 'start', 'some error occurred');
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
        displayHTML(res, `Successfully opened ${lastInstance} instances of ${browser}`);
    }
    
});

app.get('/stop', function (req, res) {
    let { browser } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;

    if(!isValidBrowser){
        throwError(res, 'geturl', 'browser should be chrome or firefox');
        return;
    }

    var instances = browserInstances[browser] || null;
    var countInstances = instances != null ? instances.length : 0;
    if(countInstances > 0){
        console.log("countInstances",countInstances)
        
        for(var i in instances){
            var {url, child} = instances[i];
            child.kill(0);
        }
    }

    displayHTML(res, `Successfully stopped ${browser}`);
});



app.get('/cleanup', function (req, res) {
    let { browser } = req.query;

    let isValidBrowser = (browser === 'chrome' || browser === 'firefox') ? true:false;

    if(!isValidBrowser){
        throwError(res, 'geturl', 'browser should be chrome or firefox');
        return;
    }

    var instances = browserInstances[browser] || null;
    var countInstances = instances != null ? instances.length : 0;
    if(countInstances > 0){
        console.log("countInstances",countInstances)
    }

    exec(`taskkill /im ${browser} /t`, (err, stdout, stderr) => {
        if (err) {
          throw err
        }
    
        console.log('stdout', stdout)
        console.log('stderr', err)
      });

      displayHTML(res, `Successfully cleaned ${browser}`);
});


app.listen(APP_PORT, () => {
 console.log(`[APP] ${Date().toString()}: Server running on port: ${APP_PORT} , ostype: ${OS_TYPE}`);
});