/**
 * log request timing
 */
module.exports = async function(ctx, next) {
    const start = new Date();

    await next();

    const end = new Date();
    const duration = end.getTime() - start.getTime();

    log(duration, ctx);
}

function log(duration, ctx) {
    console.info(`${ctx.path} ${duration}ms`);
}
