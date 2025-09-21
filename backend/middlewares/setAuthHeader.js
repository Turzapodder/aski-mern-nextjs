import jwt from "jsonwebtoken";
import refreshAccessToken from "../utils/refreshAccessTooken.js";
import setTokensCookies from "../utils/setTokensCookies.js";

const isTokenExpired = (token) => {
    if (!token) {
        return true;
    }
    try {
        const decodedToken = jwt.decode(token);
        if (!decodedToken || !decodedToken.exp) {
            return true;
        }
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
}

// This middleware will set Authorization header and will refresh access token on expire
const AccessTokenAutoRefresh = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        console.log('accessToken', accessToken);
        
        // FIXED: Check if access token exists AND is not expired
        if (accessToken && !isTokenExpired(accessToken)) {
            req.headers['authorization'] = `Bearer ${accessToken}`;
            return next(); // Token is valid, proceed
        }

        // FIXED: If access token is missing or expired, refresh tokens
        if (!accessToken || isTokenExpired(accessToken)) {
            const refreshToken = req.cookies.refreshToken;
            
            // If Refresh token is also missing, throwing an error
            if (!refreshToken) {
                throw new Error('Refresh token is missing');
            }

            // Check if refresh token is expired
            if (isTokenExpired(refreshToken)) {
                throw new Error('Refresh token is expired');
            }

            // Access token is expired, make a refresh token request
            const { newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp } = await refreshAccessToken(req, res);

            // Set cookies with new tokens
            setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

            req.headers['authorization'] = `Bearer ${newAccessToken}`;
        }
        
        next();

    } catch (error) {
        console.error('Error adding access token to header', error.message);

        // Check if response has already been sent
        if (!res.headersSent) {
            // Clear cookies on error
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            res.status(401).json({
                status: 'failed',
                message: 'Unauthorized - Please login again'
            });
        }
    }
}

export default AccessTokenAutoRefresh;