module.exports = {
    '/home': {
        page: '../client/entries/home',
        alias: '/',

    },
    '/submit': {
        page: '../client/entries/submit',
        beforeEnter: (prevent) => {
            const tmp = Math.random();

            if (tmp != 0.5) {
                prevent();
                console.warn('cant enter cause < 0.5,', tmp);
            }
        }
    },
    '/about': {
        page: '../client/entries/about',
        beforeLeave: (prevent) => {
            // const tmp = Math.random();

            // if (tmp > 0.5) {
            //     prevent();
            //     console.warn('cant leave cause > 0.5,', tmp);
            // }
        }
    }
}
