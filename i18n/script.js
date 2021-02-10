'use strict';
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

const result = excelToJson({
  sourceFile: 'i18n.xlsx',
  header: {
    rows: 1
  },
  columnToKey: {
    A: 'context',
    B: 'en',
    C: 'de',
    D: 'es',
    E: 'fr',
    F: 'it',
    G: 'pl',
    H: 'nl',
    I: 'sk',
    J: 'sv',
    K: 'hr',
    L: 'hu',
    M: 'pt',
    N: 'cs',
    O: 'fi',
    P: 'ro',
    Q: 'bg',
    R: 'el',
    S: 'mt',
    T: 'da',
    U: 'et',
    V: 'ga',
    W: 'lt',
    X: 'lv',
    Y: 'sl',
    Z: 'no'
  }
});

const langs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'nl', 'sk', 'sv', 'hr', 'hu', 'pt', 'cs', 'fi', 'ro', 'bg', 'el', 'mt', 'da', 'et', 'ga', 'lt', 'lv', 'sl', 'no'];

langs.forEach(lang => {
  const translation = {};
  result.Sheet1.forEach(row => {
    translation[row.context] = row[lang] || '';
    translation[row.context] = translation[row.context].replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25');
    translation[row.context] = decodeURIComponent(JSON.parse(`"${translation[row.context]}"`));
  })
  const langstr = JSON.stringify(translation, null, 2);
  fs.writeFile(`../src/assets/i18n/${lang}.json`, langstr, 'utf8', () => console.log(`wrote file for ${lang}`))
})
