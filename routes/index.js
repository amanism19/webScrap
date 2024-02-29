const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");

const puppeteerConf = {
  headless: false,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  timeout: 100000,
};

const autoScroll = async (page) => {
//   await page.waitForSelector('#chapter-container');
  await page?.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 3000);
    });
  });
};

const screenshot = async (page, filePath) => {
  await autoScroll(page);
  await page?.screenshot({
    path: filePath,
    fullPage: true,
  });
};

const urlValidation = (req, res) => {
  const { url } = req.body;
  console.log("Url is", url);
  if (!url) {
    res.send({
      status: "error",
      message: "missing input url",
    });
  } else {
    return url;
  }
};

const sendFile = (res, filePath) => {
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    fs.unlink(filePath, function (error) {
      if (error) {
        console.log(error);
        res.send(error);
      }
    });
  });
};

const openPage = async (browser, url) => {
  const page = await browser?.newPage();
  await page?.setViewport({ width: 1200, height: 800 });
  await page?.goto(url, {
    waitUntil: "networkidle0",
  });
  return page;
};

const handleError = async (error, res, browser) => {
  await browser?.close();
  console.log("error is", error);
  res.send({
    status: "error",
    message: error.message || "Internal Server Error",
  });
};

const handleSubError = async (error, browser) => {
  await browser?.close();
  console.log("error is", error);
};

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const router = express.Router();

router.post("/", async (req, res) => {
    const url = urlValidation(req, res);
    let browser;
    try {
      browser = await puppeteer.launch(puppeteerConf);
      const page = await openPage(browser, url);
    //   const filePath = `${__dirname}page.png`;
    //   await screenshot(page, filePath);
    const resultList = await page.evaluate(
    () => {
        const pageData = document.querySelector(".chapter-content").innerText;
        return pageData;
    });  
        await browser.close();
        res.send({
            status: "success",
            data: resultList,
        });
    } catch (error) {
      await handleError(error, res, browser);
    }
});

const getNovelID = async (browser, url) => {
    let page = await openPage(browser, url);
    page.setDefaultNavigationTimeout(0);
    const resultObject = await page.evaluate(() => {
        const firstUrl = document.querySelector("amp-list").getAttribute("src");
        const pattern = /\/(\d+)-c-(\d+)-\d\.json/;
        const match = pattern.exec(firstUrl);
        const novelID = match[1];
        const maxC = Number(match[2]);
        // console.log(novelID, maxC);
        return {novelID, maxC};
    });
    page.close();
    return resultObject;
};

const getChapterList = async(browser, novelID, c) => {
    let page = await openPage(browser, `https://www.mtlnovel.com/json/${novelID}-c-15-${c}.json`);
    page.setDefaultNavigationTimeout(0);
    let pageResult = await page.evaluate(() => {
        let items = JSON.parse(document.querySelector("body").innerText);
        // console.log(items);
        return items;
    });
    await page.close();
    return pageResult;
};

const getChapter = async(browser, url, chapterList) => {
    let page = await openPage(browser, url);
    page.setDefaultNavigationTimeout(0);
    let pageResult = await page.evaluate(() => {
        let chapter = document.querySelector('.par.fontsize-16').innerText;
        // console.log(chapter);
        return chapter;
    });
    await page.close();
    chapterList.push(pageResult);
    return pageResult;
};

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

router.post("/mtlnovel", async (req, res) => {
    const { url } = req.body;
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerConf);
        const {novelID, maxC} = await getNovelID(browser, url);
        console.log("novelID is", novelID, "maxC is", maxC);
        const urlList = [];
        for(let c=1;c<=Math.min(maxC,3);++c) {
            let pageResult = await getChapterList(browser, novelID, c);
            console.log("pageResult", pageResult);
            pageResult.items.forEach(item => {
                urlList.push(item.permalink);
            })
        }
        const chapterList = [];
        for (let i = 0; i < urlList.length; i++) {
            if (i >= 2) {
                break;
            }
            console.log("url is", urlList[i]);
            await getChapter(browser, urlList[i], chapterList);
            await wait(2000);
            // chapterData.push(chapter);
            
        }
        await browser.close();
        res.send({
            status: "success",
            length: urlList.length,
            // data: urlList,
            data: chapterList,
        });
    } catch (error) {
      await handleError(error, res, browser);
    }
});


module.exports = router;