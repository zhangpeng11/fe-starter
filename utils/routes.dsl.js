module.exports = {
    '/home': {
        page: '../client/entries/home',
        alias: '/',

    },
    '/submit': {
        page: '../client/entries/submit',
        beforeEnter: (from, to, prevent) => {
            console.info(from, to);
            const tmp = Math.random();

            if (tmp != 0.5) {
                prevent();
                console.warn('cant enter cause < 0.5,', tmp);
            }
        }
    },
    '/about': {
        page: '../client/entries/about',
        beforeLeave: (from, to, prevent) => {
            console.info(from, to);
            const tmp = Math.random();

            if (tmp > 0.5) {
                prevent();
                console.warn('cant leave cause > 0.5,', tmp);
            }
        }
    }
};
