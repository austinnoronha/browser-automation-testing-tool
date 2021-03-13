## Browser Automation Tool

Browser Automation Tool - My Demo APP

This NodeJS APP will trigger "X" no.of instances of a browser and you can cleanup the instances and user directory created on the fly. Works only with Chrome/Firefox on windows platform. 

(https://github.com/austinnoronha/browser-automation-testing-tool)[https://github.com/austinnoronha/browser-automation-testing-tool] 

### End Point APIs

Method | Endpoint | Parameter(s)
--- | --- | --- 
GET | /start | browser, url
GET | /stop | browser
GET | /cleanup | browser
GET | /geturl | browser


### APP Settings

### Firefox Path
<code>
const APP_CHROME_PATH = 'C:\.....chrome.exe';
</code>

### Chrome Path
<code>
const APP_FIREFOX_PATH = 'C:\......\firefox.exe';
</code>

### Browser Instance Data Directory
<code>
const APP_BROWSER_USER_DIR = 'C:\Users\\Downloads\BrowserInstanceTestingData';
</code>