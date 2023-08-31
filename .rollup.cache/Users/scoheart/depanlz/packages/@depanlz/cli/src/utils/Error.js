import { red } from "./colorful";
class UnkonwnCommandError extends Error {
    constructor(message) {
        super(red(message));
        this.name = "UnkonwnCommandError";
    }
}
export { UnkonwnCommandError, };
//# sourceMappingURL=Error.js.map