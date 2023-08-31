const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
function red(str) {
    return RED + str + RESET;
}
function green(str) {
    return GREEN + str + RESET;
}
function yellow(str) {
    return YELLOW + str + RESET;
}
export { red, yellow, green };
//# sourceMappingURL=colorful.js.map