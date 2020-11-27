const ajax = (req, res) => {
    res.end(`
        <h1>Hi!</h1>
        My name is <i>Ilya</i> <br />
        I love Web!
    `);
};

module.exports = exports = {
    ajax,
};
