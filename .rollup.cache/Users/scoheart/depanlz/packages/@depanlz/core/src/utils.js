import * as fs from 'fs';
function isFileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    }
    catch (err) {
        return false;
    }
}
export { isFileExists, };
//# sourceMappingURL=utils.js.map