const Annotation = require('conga-annotations').Annotation;

module.exports = class Trigger extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
}
