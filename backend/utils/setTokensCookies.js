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

    // Determine if we should set is_auth to true
    const shouldSetIsAuth = !user || 
                           !user.roles.includes('tutor') || 
                           (user.roles.includes('tutor') && user.onboardingStatus === 'completed');

    // Set Cookie for is_auth only if user is not a tutor with pending onboarding
    if (shouldSetIsAuth) {
        res.cookie('is_auth', true, getCookieOptions(refreshTokenMaxAge, { httpOnly: false }));
    } else {
        // For tutors with pending onboarding, set is_auth_pending
        res.cookie('is_auth', true, getCookieOptions(refreshTokenMaxAge, { httpOnly: false }));
    }
}

export default setTokensCookies;