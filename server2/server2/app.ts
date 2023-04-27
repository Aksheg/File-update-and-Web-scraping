import http, { IncomingMessage, Server, ServerResponse } from "http";
import * as cheerio from "cheerio";
import axios from "axios";
import * as url from "url";

const server: Server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = url.parse(req.url as string, true);
    if (req.method === "GET" && parsedUrl.pathname === "/web-scrape") {
      try {
        const urlToScrape = parsedUrl.query.url as string;
        const response = await axios.get(urlToScrape);
        const $ = cheerio.load(response.data);
        const title = $("title").text();
        const desc = $('meta[name="description"]').attr("content");
        const imgUrls: string[] = [];
        $("img").each((i: any, image: any) => {
          const imgUrl: any = $(image).attr("src");
          imgUrls.push(imgUrl);
        });

        const data = {
          Title: title,
          Description: desc,
          ImageUrls: imgUrls,
        };

        res
          .writeHead(200, { "Content-Type": "text/HTML" })
          .end(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(err);
      }
    } else {
      res
        .writeHead(404, { "Content-Type": "text/HTML" })
        .end(JSON.stringify({ alert: "Route Unavailable" }));
    }
  }
);

server.listen(3001, () => console.log(`Port Running`));


