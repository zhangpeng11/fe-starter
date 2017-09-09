module.exports = {
    '/home': {
        page: '../client/entries/home',
        alias: '/',
        beforeLeave: (prevent) => {
            const tmp = Math.random();

            if (tmp > 0.5) {
                prevent();
                console.warn('cant leave cause > 0.5,', tmp);
            }
        }
    },
    '/submit': '../client/entries/submit',
    '/about': {
        page: '../client/entries/about',
        beforeLeave: (prevent) => {
            const tmp = Math.random();

            if (tmp > 0.5) {
                prevent();
                console.warn('cant leave cause > 0.5,', tmp);
            }
        }
    }
}
