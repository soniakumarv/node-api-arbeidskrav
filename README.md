<h1>** DOCUMENTATION **</h1>

 <h2>INSTALL</h2>

 <p>Clone repository from Github. Follow commands down below </p>
 
 <p>$ cd for project map</p>
 <p>$ git clone {Github repository link}</p>
 <p>$ cd {prosjket}</p>
 <p>npm install</p>

 <h2>API documentation</h2>

 <h3>POST/item</h3>
 <p>
 {
    "name":"string/number",
    "category": "string",
    "price": "number"
 }
 </p>

 <h3>POST/card</h3>
<p>
 {
    "card_number":"number",
    "store_name":"string",
    "store_location":"string",
    "date":"DD.MM.YY"
 }
 </p>

<h3>GET/card/:card_number</h3>
<p>
 {
    "card_number":"number"
 }
 </p>

 <h3>GET/store_name</h3>
<p>
 {
    "store_name":"string"
 }
 </p>

 <h3>GET/day/:date</h3>
<p>
 {
   "date":"DD.MM.YY"
 }
 </p>

 <h3>GET /month/:month_number/:year_number</h3>
<p>
 {
   "date":"MM.YY"
 }
 </p>

 <h3>GET /month/:month_number/:year_number</h3>
<p>
 {
   "store_location":"string"
 }
 </p>

<h3>DELETE /card/:card_number</h3>
<p>
 {
   "card_number":"number"
 }
 </p>

<h2>ERRORS</h2>
<p>I added if/else checks on the endpoints with general messages. It gives the user enough information on if it worked or if there were something wrong. The fields where it should be numbers written i did a Number() check so it is not possible to write text</p>
