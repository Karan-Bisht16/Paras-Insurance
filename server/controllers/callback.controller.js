// working
const createCallback = async (req, res) => {
    try {
        console.log(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchAllCallback = async (req, res) => {
    try {
        console.log(req.query);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    createCallback,
    fetchAllCallback,
}