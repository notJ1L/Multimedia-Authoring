const fs = require('fs');
const jsPath = 'c:\\xampp_ITCP226\\htdocs\\MultimediaWeb\\script.js';
const pyPath = 'c:\\xampp_ITCP226\\htdocs\\MultimediaWeb\\Python Code\\SolarSystem.py';

let jsContent = fs.readFileSync(jsPath, 'utf8');
let pyContent = fs.readFileSync(pyPath, 'utf8');

// Escape backticks and slashes so it can be safely injected into a JS template literal
let escapedPy = pyContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

let newCode = `\n    "Python Code/SolarSystem.py": \`${escapedPy}\`,\n    'Python Code/SunPython.py':`;

// Check if already injected
if (!jsContent.includes('"Python Code/SolarSystem.py"')) {
    jsContent = jsContent.replace(/'Python Code\/SunPython\.py':/, newCode);
    fs.writeFileSync(jsPath, jsContent);
    console.log("Successfully injected SolarSystem.py into script.js");
} else {
    console.log("SolarSystem.py already injected.");
}
