import { red, yellow, green } from '../utils/colorful';
function log(message) {
    console.log(message);
}
function warn(message) {
    console.log(yellow(message));
}
function error(message) {
    console.log(red(message));
}
function success(message) {
    console.log(green(message));
}
export { log, warn, error, success };
//# sourceMappingURL=colorConsole.js.map