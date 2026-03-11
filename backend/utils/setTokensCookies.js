import { getCookieOptions } from "./cookieOptions.js";

const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp, user = null) => {

    const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
    const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

    // Validate maxAge values
    if (accessTokenMaxAge <= 0 || refreshTokenMaxAge <= 0) {
        console.error('Invalid maxAge values:', { accessTokenMaxAge, refreshTokenMaxAge });
        throw new Error('Invalid token expiration times');
    }

    // Set Cookies for Access Token
    res.cookie('accessToken', accessToken, getCookieOptions(accessTokenMaxAge, { httpOnly: true }));
    
    // Set Cookies for Refresh Token
    res.cookie('refreshToken', refreshToken, getCookieOptions(refreshTokenMaxAge, { httpOnly: true }));

    // Non-httpOnly auth marker cookies used by frontend middleware/UI state.
    const role = user?.roles?.includes('admin')
        ? 'admin'
        : user?.roles?.includes('tutor')
        ? 'tutor'
        : 'user';

    res.cookie('is_auth', 'true', getCookieOptions(refreshTokenMaxAge, { httpOnly: false }));
    res.cookie('user_role', role, getCookieOptions(refreshTokenMaxAge, { httpOnly: false }));
}

export default setTokensCookies;