const Annotation = require('conga-annotations').Annotation;

module.exports = class Params extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
}
