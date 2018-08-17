const http = require("http");
const fs = require("fs");
const query = require("querystring");

const PORT = process.env.PORT || 8080;

//Arrays to house urls and element
//The first usage of the array is to later call on in the template literals when making a new index.html and a new "element".html
//The second usage is to use it to check for a page that exist when using a "GET" request method
let urlArr = ["/", "/css/styles.css", "/hydrogen.html", "/helium.html"];
let elementArr = ["none", "none", "Hydrogen", "Helium"];

const server = http.createServer((req, res) => {

  //Get Method
  if (req.method === "GET") {
    console.log("req.url", req.url);

    //urlArr.filter(uri =>
    //uri === req.url
    //) creates an array that is used in the if statement to check for the length. If the length is less than 1 (basically 0), then it means that the url that is used to filter the array doesn't exist in the urlArray.

    let filteredUrlArr = urlArr.filter(uri =>
      uri === req.url
    );

    //This is to check if the url that is being requested through "GET" exist in the array (if you have a .html for it)
    //If it doesnt exist, then it will return a 404.html page
    if ((filteredUrlArr.length) < 1) {
      console.log(urlArr, "This better be the right arr");
      console.log(filteredUrlArr, "wtf did i create?");
      console.log(filteredUrlArr.length, "Wtf is length on this?");
      console.log("Did I srsly hit here?");
      fs.readFile("./public/404.html", "utf-8", (err, data) => {
        if (err) throw err;
        res.writeHead(404, {
          "Content-Type": "text/html"
        });
        res.write(data);
        res.end();
      })

      //This is to check if the client has the CSS after the server requested it 
    } else if (req.url === "/css/styles.css") {
      fs.readFile("./public/css/styles.css", "utf-8", (err, data) => {
        if (err) throw err;
        res.writeHead(200, {
          "Content-Type": "text/css"
        });
        res.write(data);
        res.end();
      })

      //This else is for the rest of the HTML's since everything else has been checked for
    } else {

      //The index.html is hardcoded to check for "/" because if readfile(`./public${req.url}`) is used for the index, the req.url is only / and readfile can't read ./public/, it needs to read ./public/index.html. So this is hardcoded
      if (req.url === "/") {
        console.log("Tell me I hit here at least");
        fs.readFile(`./public/index.html`, "utf-8", (err, data) => {
          if (err) throw err;
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          res.write(data);
          res.end();
        })

        //This is dynamic so that everything that is being requested through "GET" is pulled from ${req.url}. There is no longer a need to hardcode each file path like /public/hydrogen.html or /public/helium.html
        //If there are hardcoded file paths, there needs to be a hardcoded if request for every element
        //*****If there are hardcoded if checks, then when there is a post request for a new "element".html to be created, the code can't check for it since there was no hardcoded if check for that newly created element.*****//
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

    //Post Method
  } else if (req.method === "POST") {

    //Code on https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/ to parse out the body
    if (req.url) {
      let body = [];
      req.on("data", chunk => {
        body.push(chunk);
      }).on("end", chunk => {
        body = Buffer.concat(body).toString();
        let parsedBody = query.parse(body);

        //This is a check in the urlArr to see if that current url that is being requested to be made exist
        //If it does exist, it splices out the current url and pushes the new url
        //If it doesn't exist, it pushes in the url into the array
        if ((urlArr.filter(url => url === `/${(parsedBody.elementName).toLowerCase()}.html`)).length < 1) {
          urlArr.push(`/${(parsedBody.elementName).toLowerCase()}.html`);
        } else {
          urlArr.splice(urlArr.indexOf(`/${(parsedBody.elementName).toLowerCase()}.html`), 1, `/${(parsedBody.elementName).toLowerCase()}.html`)
        }

        //This is a check in the elementArr to see if that current url that is being requested to be made exist
        //If it does exist, it splices out the current element and pushes the new element
        //If it doesn't exist, it pushes in the element into the array
        if ((elementArr.filter(element => element === parsedBody.elementName)).length < 1) {
          elementArr.push(parsedBody.elementName);
        } else {
          elementArr.splice(elementArr.indexOf(parsedBody.elementName), 1, parsedBody.elementName)
        }

        //This is the newElement template literal for the new "element".html page
        //This will be called to create a new html for that corresponding element in the fs.writeFile()
        let newElement = `<!DOCTYPE html>
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
          <p>${parsedBody.elementName} is a chemical element with chemical symbol ${parsedBody.elementSymbol} and atomic number ${parsedBody.elementAtomicNumber}. ${parsedBody.elementDescription}</p>
          <p><a href="/">back</a></p>
        </body>
        
        </html>`;

        //This is a string variable that is created so that it can be called in the newList function
        let listString = "";

        //newList function so that a new <li> can be created for every element in the url/element array in the newIndex template literal
        const newList = (arrOne, arrTwo) => {

          //for loop that will start at i = 2 because the arrays are intentionally set up so that it has index.html and styles.css in the first two elements. The links that the function wants to create are only for elements not index.html and styles.css so the loop skips them at starts at i = 2.
          for (var i = 2; i < arrOne.length; i++) {
            //***** THIS IS KEY, += into the string will append the template literal into the current string *****//
            listString += `
            <li>
              <a href="${arrOne[i]}">${arrTwo[i]}</a>
            </li>\r\n` //* \r\n is key as well as that will create a new line for every li instead of just one horiztonal list 
          }
          //return is used just to call on the variable so it that there is no error on declaration of variable
          return listString;
        };

        //This is the newIndex template literal for the new index.html page that will be created for every new element that needs to be made so that <h3> can be updated and <ol> can be updated according to every element that has been made
        //replaces the old index.html to be updated for the elements that are added so a new homepage correctly reflects the new elements
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

        //These are the locations that are used in the two fs.writeFile() below
        let elementLocation = `./public/${(parsedBody.elementName).toLowerCase()}.html`
        let indexLocation = `./public/index.html`

        //This is putinside a function so that it can be used as a callback inside the other writeFile()
        //This is for the new index.html
        let newIndexPage = () => {
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
        }

        //This writeFile() is for the new "element".html
        //Notice the newIndexPage() function being used as a callback as one of the arguments in fs.writeFile()
        //This is in the docs for fs.writeFile()
        //Also notice there is no res.write() or res.end() in the fs.writeFile() but there is a res.write() and res.end() in the callback function. 
        //This is because if there was a res.write() and res.end() before the second fs.writeFile() is called, there would be an error as fs cannot write another file after an end. So it writes the head 200 after the sucess of writefile then callsback the second write file function newIndexPage() and in there it has a res.write() and res.end().
        fs.writeFile(elementLocation, newElement, newIndexPage(), err => {
          if (err) {
            res.writeHead(500);
            res.write('{"success": false }');
            res.end()
          } else {
            res.writeHead(200);
          }
        })

      })
    }
  }

})

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
})