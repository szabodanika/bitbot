const Annotation = require('conga-annotations').Annotation;

module.exports = class Hidden extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
};
