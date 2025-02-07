import jwt from "jsonwebtoken";
import refreshAccessToken from "../utils/refreshAccessTooken.js";
import setTokensCookies from "../utils/setTokensCookies.js";


const isTokenExpired = (token) => {
    if (!token) {
        return true;
    }
    const decodedToken = jwt.decode(token)
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime
}
// This middleware will set Authorization header and will refresh access token on expire
const AccessTokenAutoRefresh = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        // check if access token is still valid, then set the authorization an bearer
        if (accessToken || !isTokenExpired(accessToken)) {
            req.headers['authorization'] = `Bearer ${accessToken}`
        }

        // if access token is  expired, refresh tokens
        if (!accessToken || isTokenExpired(accessToken)) {
            const refreshToken = req.cookies.refreshToken;
            // if Refresh token is also missing, throwing an error
            if(!refreshToken){
                throw new Error('Refresh token is missing');
            }

            // Access token is expired, make a refresh token request
            const {newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp} = await refreshAccessToken(req, res);

            // set cokkies with new tokens
            setTokensCookies(res, newAccessToken,newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

            req.headers['authorization'] = `Bearer ${newAccessToken}`
        }
        next()

    } catch (error) {
        console.error('Error adding access token to header', error.message);

        res.status(401).json({error: 'Unauthorized', message: 'Access token is missing or invalid'});
    }
}


export default AccessTokenAutoRefresh;