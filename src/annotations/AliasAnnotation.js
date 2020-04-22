const Annotation = require('conga-annotations').Annotation;

module.exports = class Aliases extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
}
