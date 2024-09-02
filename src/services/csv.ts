import { promises as fs } from 'fs';
import os from 'os';
import { parse } from 'csv-parse/sync'; // Use the synchronous version for simplicity
import path from 'path';

const currentDirectory = process.cwd();

const rootDirectory = currentDirectory.includes('/src')
  ? path.resolve(currentDirectory, '../')
  : currentDirectory;


interface ValidEmailFile {
    isValid: boolean,
    emailCount: number
}

export async function isValidEmailFile(file) : Promise<ValidEmailFile>{
    try {
        const content = file.buffer.toString("utf8");

        const records = parse(content, {
            columns: true,  // Automatically extract column names as the first row
            skip_empty_lines: true,
          });
      
      
          const emails = records.map(record => record['Email']).filter(Boolean);
          
          return  {isValid: true, emailCount: emails.length };
    }
    catch (error){
        console.error(error);
        return {isValid: false, emailCount: 0 };
    }
}

export async function getEmails() {
  try {
    // Read the CSV file
    const fileDir = `${rootDirectory}/uploads/csv/email.csv`;
    const content = await fs.readFile(fileDir, 'utf8');

    // Parse the CSV content
    const records = parse(content, {
      columns: true,  // Automatically extract column names as the first row
      skip_empty_lines: true,
    });


    // Assuming that the email column is named 'Email' (you can adjust based on your CSV file)
    const emails = records.map(record => record['Email']).filter(Boolean);

    console.log('Emails:', emails);
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
  }
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
