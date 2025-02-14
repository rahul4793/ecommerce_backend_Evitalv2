import ini from 'ini';
import fs from 'fs';

const config = ini.parse(fs.readFileSync('./en.ini', 'utf-8'));

export const getTranslation = (key: string): any => {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : key), config);
};
