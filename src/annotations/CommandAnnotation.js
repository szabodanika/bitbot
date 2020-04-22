const Annotation = require('conga-annotations').Annotation;

module.exports = class Command extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
}
