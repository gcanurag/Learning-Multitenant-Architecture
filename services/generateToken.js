const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                expiresIn: "20d"
            });
}

module.exports = generateToken;