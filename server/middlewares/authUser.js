import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized - No Token' });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (!tokenDecode.id) {
            return res.status(401).json({ success: false, message: 'Not Authorized - Invalid Payload' });
        }

        req.user = { id: tokenDecode.id };  // ✅ Always attach user
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not Authorized - Invalid Token' });
    }
};

export default authUser;
