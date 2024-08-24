import express from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';


const currentDirectory = process.cwd();

export const fileRouter = express.Router();

const rootDir = currentDirectory.includes('/src')
? path.resolve(currentDirectory, '../')
: currentDirectory;

const fileDir = `${rootDir}/uploads/option-images`;

fileRouter.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(fileDir, filename);


    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(StatusCodes.NOT_FOUND).end();
        }
    });
});