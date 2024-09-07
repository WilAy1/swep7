import { promises as fs } from 'fs';
import os from 'os';
import { parse } from 'csv-parse/sync'; // Use the synchronous version for simplicity
import path from 'path';
import { isValidEmail } from '../utils/utils';
import XLSX from 'xlsx';
import { stringify } from 'csv-stringify';

const currentDirectory = process.cwd();

const rootDirectory = currentDirectory.includes('/src')
  ? path.resolve(currentDirectory, '../')
  : currentDirectory;


interface ValidEmailFile {
    isValid: boolean,
    emailAddresses: string[]
}

enum EmailFileTypes {
  CSV,
  XLSX
}

function getFileType(file){
  const mimeType = file.mimetype;

  if (mimeType === 'text/csv') {
    return EmailFileTypes.CSV;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return EmailFileTypes.XLSX;
  } else {
    return;
  }
}

export async function isValidEmailFile(file) : Promise<ValidEmailFile>{
    try {

      let emailCount = 0;
      let emailAddresses;
      const fileType = getFileType(file)
      switch(fileType){
        case EmailFileTypes.CSV:
          emailAddresses = await readCSV(file);
          break;
        case EmailFileTypes.XLSX:
          emailAddresses = await readXLSX(file);
          break;
        default:
          emailAddresses = [];
      }

      emailCount = emailAddresses.length;

      //console.log(emailCount);
        //readCSV(file);
        //readXLSX(file);
        // const content = file.buffer.toString("utf8");

        // const records = parse(content, {
        //     columns: true,
        //     skip_empty_lines: true,
        //   });
      
      
        //   const emails = records.map(record => record['Email']).filter(Boolean);
          
          return  {isValid: emailCount > 0, emailAddresses: emailAddresses};
    }
    catch (error){
        console.error(error);
        return {isValid: false, emailAddresses: [] };
    }
}

export async function readCSV(file) {
  try {

    const content = file.buffer.toString("utf8");

    const records = parse(content, {
      columns: false,
      skip_empty_lines: true,
    });

    const validEmailAddresses = [];

     records.forEach(record => {
       record.forEach(data => {
        if(isValidEmail(data)){
          if(!validEmailAddresses.includes(data)){
            validEmailAddresses.push(data);
          }
        }
       })
     })

    return validEmailAddresses;

  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    return [];
  }
}

export async function readXLSX(file){
  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });


    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1, 
    });

    const validEmailAddresses = [];

    // Loop through rows and columns to extract emails
    worksheet.forEach(row => {
      (row as any[]).forEach(cell => {
        if (isValidEmail(cell)) {
          if (!validEmailAddresses.includes(cell)) {
            validEmailAddresses.push(cell);
          }
        }
      });
    });

    return validEmailAddresses;

  }
  catch(error){
    console.error(error);
    return [];
  }
}

export function generateCSV(emailAddresses) {
  return new Promise((resolve, reject) => {
    const emailObjects = emailAddresses.map(email => ({ email }));
    stringify(emailObjects, {
      header: true, 
      columns: ['email']
    }, (err, output) => {
      if (err) {
        return reject(undefined);
      }
      resolve(output);
    });
  });
}


export async function checkEmailInCsv(emailAddress: string, inCollection:string): Promise<boolean> {
    try {
        const fileDir = `${rootDirectory}/uploads/csv/${inCollection}.csv`;
        const content = await fs.readFile(fileDir, 'utf8');
    
        const records = parse(content, {
          columns: true, 
          skip_empty_lines: true,
        });
    

        const emails : Array<any> = records.map(record => getValueCaseInsensitive(record, 'email')).filter(Boolean);
        
        return emails.includes(emailAddress);
    }
    catch(error) {
        console.error('Error reading or parsing file', error);
        return false;
    }
}

function getValueCaseInsensitive(obj: Object, key: String) {
  const lowerCaseKey = key.toLowerCase();

  for (const k in obj) {
    if (obj.hasOwnProperty(k) && k.toLowerCase() === lowerCaseKey) {
      return obj[k];
    }
  }
  
  return undefined;
}
