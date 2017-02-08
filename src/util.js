'use strict';

module.exports = {
    isNullOrUndefined: function(value) {
        return value === null || value === undefined;
    },
    mod: function(n, m) {
        return ((n % m) + m) % m;
    }
};
