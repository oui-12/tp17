const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Charger la définition Protobuf
const root = protobuf.loadSync('employee.proto');

// Récupérer le type "Employees"
const EmployeeList = root.lookupType('Employees');

// Liste d’employés
const employees = [
  { id: 1, name: 'Ali', salary: 9000 },
  { id: 2, name: 'Kamal', salary: 12000 },
  { id: 3, name: 'Amal', salary: 20000 }
];

// Objet JSON racine
let jsonObject = { employee: employees };

// -----------------------------
// JSON : encodage et décodage
// -----------------------------

console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// Sauvegarde JSON
fs.writeFileSync('data.json', jsonData);

// -----------------------------
// XML : encodage et décodage
// -----------------------------

const xmlOptions = { compact: true, ignoreComment: true, spaces: 0 };

console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, xmlOptions) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// Sauvegarde XML
fs.writeFileSync('data.xml', xmlData);

// -----------------------------
// Protobuf : encodage & décodage
// -----------------------------

let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error(errMsg);

let message = EmployeeList.create(jsonObject);

console.time('Protobuf encode');
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// Sauvegarde Protobuf
fs.writeFileSync('data.proto', buffer);


const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log("\n--- Taille des formats ---");
console.log(`JSON :   ${jsonFileSize} octets`);
console.log(`XML  :   ${xmlFileSize} octets`);
console.log(`PROTO:   ${protoFileSize} octets`);

console.log("\nFichiers générés : data.json, data.xml, data.proto");
