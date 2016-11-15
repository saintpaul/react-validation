class Responsive {
    static isTablet = () => window.innerWidth <= 1024; // Not the best option, but should enough
}

module.exports = Responsive;