'use strict';

module.exports = {
    /**
     * Check if a given value of null or undefined.
     *
     * @param {*} value - The query value.
     * @returns {boolean} - Whether or not the given value is null or undefined.
     */
    isNullOrUndefined: function(value) {
        return value === null || value === undefined;
    },

    /**
     * Find the modulo m for number n. This is used in place of the JS % operator as it behaves
     * as one would with negative numbers expect, while the default JS implementation.
     *
     * @param {number} n - The number n.
     * @param {number} m - Modulo m.
     * @returns {number} - The result of of n mod m.
     */
    mod: function(n, m) {
        return ((n % m) + m) % m;
    }
};
