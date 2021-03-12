## Browser AUtomation Tool

This NodeJS APP will trigger "X" no.of instances of a browser


### End Point APIs

Method | Endpoint | Parameter(s)
--- | --- | --- 
GET | /start | browser, url
GET | /stop | browser
GET | /cleanup | browser
GET | /geturl | browser


### APP Settings
const APP_CHROME_PATH = 'C:\.....chrome.exe';
const APP_FIREFOX_PATH = 'C:\......\firefox.exe';
const APP_BROWSER_USER_DIR = 'C:\Users\\Downloads\BrowserInstanceTestingData';