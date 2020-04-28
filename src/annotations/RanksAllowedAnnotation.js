const Annotation = require('conga-annotations').Annotation;

module.exports = class RanksAllowed extends Annotation {
    static get targets() {
        return [Annotation.METHOD]
    }
};
