class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = AssertionError.name;
    }
}

/** Throws an {@link AssertionError} if `condition` is `false` */
export default function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new AssertionError(message);
    }
}
