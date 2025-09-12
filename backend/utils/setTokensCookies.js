const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp, user = null) => {

    const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
    const refreshTokenMaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

    // Set Cookies for Access Token
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: accessTokenMaxAge,
    });
    // Set Cookies for Refresh Token
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: refreshTokenMaxAge,
    });

    // Determine if we should set is_auth to true
    const shouldSetIsAuth = !user || 
                           !user.roles.includes('tutor') || 
                           (user.roles.includes('tutor') && user.onboardingStatus === 'completed');

    // Set Cookie for is_auth only if user is not a tutor with pending onboarding
    if (shouldSetIsAuth) {
        res.cookie('is_auth', true, {
            httpOnly: false,
            secure: false, // Set to true if using HTTPS
            maxAge: refreshTokenMaxAge,
            // sameSite: 'strict', // Adjust according to your requirements
        });
    } else {
        // For tutors with pending onboarding, set is_auth_pending
        res.cookie('is_auth', false, {
            httpOnly: false,
            secure: false,
            maxAge: refreshTokenMaxAge,
        });
    }
}

export default setTokensCookies;