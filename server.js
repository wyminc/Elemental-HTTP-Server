const http = require("http");
const fs = require("fs");
const query = require("querystring");

const PORT = process.env.PORT || 8080;

let urlArr = ["/", "/css/styles.css", "/hydrogen.html", "/helium.html"];
let elementArr = ["none", "none", "Hydrogen", "Helium"];

const server = http.createServer((req, res) => {
  console.log("req.method", req.method);
  console.log("req.url", req.url);
  // console.log("res", res);

  if (req.method === "GET") {
    console.log(urlArr);
    console.log(elementArr);
    if ((urlArr.filter(uri => uri === req.url).length) < 1) {
      fs.readFile("./public/404.html", "utf-8", (err, data) => {
        if (err) throw err;
        res.writeHead(404, {
          "Content-Type": "text/html"
        });
        res.write(data);
        res.end();
      })
    } else if (req.url === "/css/styles.css") {
      console.log("I SHOULD BE CSS");
      fs.readFile("./public/css/styles.css", "utf-8", (err, data) => {
        if (err) throw err;
        res.writeHead(200, {
          "Content-Type": "text/css"
        });
        res.write(data);
        res.end();
      })
    } else {
      if (req.url === "/") {
        fs.readFile(`./public/index.html`, "utf-8", (err, data) => {
          if (err) throw err;
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          res.write(data);
          res.end();
        })
      } else {
        fs.readFile(`./public${req.url}`, "utf-8", (err, data) => {
          if (err) throw err;
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          res.write(data);
          res.end();
        })
      }
    }
  } else if (req.method === "POST") {
    console.log("HI IM HERE CORRECTLY");
    if (req.url) {
      let body = [];
      req.on("data", chunk => {
        body.push(chunk);
      }).on("end", chunk => {
        body = Buffer.concat(body).toString();
        console.log("body", body);
        let parsedBody = query.parse(body);
        console.log("parsedBody", parsedBody);

        urlArr.push(`/${(parsedBody.elementName).toLowerCase()}.html`);
        elementArr.push(parsedBody.elementName);

        let indexBody = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
          <meta charset="UTF-8">
          <title>The Elements - ${parsedBody.elementName}</title>
          <link rel="stylesheet" href="/css/styles.css">
        </head>
        
        <body>
          <h1>${parsedBody.elementName}</h1>
          <h2>${parsedBody.elementSymbol}</h2>
          <h3>Atomic number ${parsedBody.elementAtomicNumber}</h3>
          <p>${parsedBody.elementDescription}</p>
          <p><a href="/">back</a></p>
        </body>
        
        </html>`;

        let listString = "";

        const newList = (arrOne, arrTwo) => {
          for (var i = 2; i < arrOne.length; i++) {
            listString += `<li>
              <a href="${arrOne[i]}">${arrTwo[i]}</a>
            </li>\r\n`
          }
          return listString;
        };

        let newIndex = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
          <meta charset="UTF-8">
          <title>The Elements</title>
          <link rel="stylesheet" href="/css/styles.css">
        </head>
        
        <body>
          <h1>The Elements</h1>
          <h2>These are all the known elements.</h2>
          <h3>These are ${(urlArr.length - 2)}</h3>
          <ol>
            ${newList(urlArr, elementArr)}
          </ol>
        </body>
        
        </html>`;

        let elementLocation = `./public/${(parsedBody.elementName).toLowerCase()}.html`
        let indexLocation = `./public/index.html`

        fs.writeFile(elementLocation, indexBody, err => {
          if (err) {
            res.writeHead(500);
            res.write('{"success": false }');
            res.end()
          } else {
            res.writeHead(200);
          }
        })

        fs.writeFile(indexLocation, newIndex, err => {
          if (err) {
            res.writeHead(500);
            res.write('{"success": false }');
            res.end()
          } else {
            res.writeHead(200);
            res.write('{"success": true }')
            res.end();
          }
        })
      })
    }
  }

})

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
})