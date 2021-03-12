## Browser Automation Tool

This NodeJS APP will trigger "X" no.of instances of a browser
Works only with Chrom/Firefox on windows platform.

### End Point APIs

Method | Endpoint | Parameter(s)
--- | --- | --- 
GET | /start | browser, url
GET | /stop | browser
GET | /cleanup | browser
GET | /geturl | browser


### APP Settings

<code>
Firefox Path - const APP_CHROME_PATH = 'C:\.....chrome.exe';

Chrome Path - const APP_FIREFOX_PATH = 'C:\......\firefox.exe';

Browser Instance Data Directory - const APP_BROWSER_USER_DIR = 'C:\Users\\Downloads\BrowserInstanceTestingData';
</code>