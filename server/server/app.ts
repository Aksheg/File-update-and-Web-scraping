// /*
// implement your server code here
// */
import http from "http";
import fs from "fs";
// import url from 'url'
const url = require("url");
import { IncomingMessage, ServerResponse } from "http";

const DB_FILE: any = "./database.json";

fs.writeFile(DB_FILE, "[]", { flag: "wx" }, (err) => {
  if (err && err.code !== "EEXIST") {
    throw err;
  }
});

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const parsedurl = url.parse(req.url);
    const path = parsedurl.pathname;
    const id = Number(path.split("/")[2]);

    if (req.method === "GET" && req.url?.startsWith("/organisation")) {
      const parsedUrl = url.parse(req.url);
      const path = parsedUrl.pathname;
      const id = Number(path.split("/")[2]);

      fs.readFile(DB_FILE, "utf8", (err, data) => {
        if (err) throw err;

        const companies = JSON.parse(data);
        let response;

        if (Number.isNaN(id)) {
       
          response = companies;
        } else {
          // Return organization with specified id
          const organization = companies.find(
            (company: { id: number }) => company.id === id
          );
          if (organization) {
            response = organization;
          } else {
            res.statusCode = 404;
            response = { message: `Organization with id=${id} not found` };
          }
        }

        res.end(JSON.stringify(response));
      });
    } else if (req.method === "POST" && req.url === "/organisation") {
      let requestBody = "";

      req.on("data", (chunk) => {
        requestBody += chunk.toString();
      });

      req.on("end", () => {
        const newRecord = JSON.parse(requestBody);
        newRecord.noOfEmployees = newRecord.employees.length;
        newRecord.createdAt = new Date().toISOString();
        newRecord.updatedAt = new Date().toISOString();

        fs.readFile(DB_FILE, "utf8", (err, data) => {
          if (err) throw err;
          const companies = JSON.parse(data);

          newRecord.id = companies.length + 1;

          companies.push(newRecord);

          fs.writeFile(DB_FILE, JSON.stringify(companies), (err) => {
            if (err) throw err;
            res.end(JSON.stringify(newRecord));
          });
        });
      });
    } else if (req.method === "PUT" && req.url?.startsWith("/organisation/")) {
      const id = Number(req.url.split("/")[2]);

      let requestBody = "";
      req.on("data", (chunk) => {
        requestBody += chunk.toString();
      });
      req.on("end", () => {
        const updatedRecord = JSON.parse(requestBody);
        updatedRecord.noOfEmployees = updatedRecord.employees.length;
        updatedRecord.updatedAt = new Date().toISOString();

        fs.readFile(DB_FILE, "utf8", (err, data) => {
          if (err) throw err;
          const companies = JSON.parse(data);

          // Find record to update
          const recordIndex = companies.findIndex(
            (record: any) => record.id === id
          );
          if (recordIndex === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Record not found" }));
          } else {
            // Update record
            updatedRecord.id = id;
            companies[recordIndex] = updatedRecord;

            // Write updated data to database.json
            fs.writeFile(DB_FILE, JSON.stringify(companies), (err) => {
              if (err) throw err;
              res.end(JSON.stringify(updatedRecord));
            });
          }
        });
      });
    } else if (req.method === "DELETE") {
      // Parse request URL to get record id
      const urlParts: string[] = req.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 1]);

      fs.readFile("./database.json", "utf8", (err, data) => {
        let companies = [];
        if (!err) {
          companies = JSON.parse(data);
        }
        // Find record to delete
        const recordIndex = companies.findIndex(
          (record: any) => record.id === id
        );
        if (recordIndex === -1) {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: "Record not found" }));
        } else {
          companies.splice(recordIndex, 1);
          fs.writeFile("./database.json", JSON.stringify(companies), (err) => {
            if (err) throw err;
            res.end(JSON.stringify({ message: "Record deleted successfully" }));
          });
        }
      });
    } else {
      res.statusCode = 405;
      res.end(JSON.stringify({ message: "Method not allowed" }));
    }
  }
);

server.listen(3006, () => {
  console.log("Server listening on port 3006");
});
