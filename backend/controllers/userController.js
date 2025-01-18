import UserModel from "../models/User.js";
import bcrypt from 'bcrypt'
import sendEmailVerifyOTP from "../utils/sendEmailVerifyOtp.js";
import EmailVerificationModel from "../models/EmailVerification.js";
import generateTokens from "../utils/generateTokens.js";
import setTokensCookies from "../utils/setTokensCookies.js";
import refreshAccessToken from "../utils/refreshAccessTooken.js";

class UserController {

    //User Registration
    static userRegistration = async (req, res) => {
        try {

            const { name, email, password, password_confirmation } = req.body;

            //check if all required field are provided
            if (!name || !email || !password || !password_confirmation) {
                return res.status(400).json({ status: "failed", message: "All field are required" });
            }

            //check if Password and Confirm Password don't match
            if (password !== password_confirmation) {
                return res.status(409).json({ status: "failed", message: "Password and Confirm Password don't match" });
            }

            //check if Email already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ status: "failed", message: "Email already exists" });
            }

            // Genereate salt and hash password
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashedPassword = await bcrypt.hash(password, salt);

            //Create new user
            const newUser = await new UserModel({ name, email, password: hashedPassword }).save();

            sendEmailVerifyOTP(req, newUser);

            //send success response
            res.status(201).json({
                status: "success",
                message: "Registation Success",
                user: { id: newUser._id, email: newUser.email }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to Register, please try again later" });
        }
    }
    //User Email Verification
    static verifyEmail = async (req, res) => {
        try {

            // Extract request body parameters
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({ status: "failed", message: "All field are required" });
            }

            // Check if email doesn't exists
            const existingUser = await UserModel.findOne({ email });
            if (!existingUser) {
                return res.status(404).json({ status: "failed", message: "Email Doesn't exists" });
            }

            // check if user email already verified
            if (existingUser.is_verified) {
                return res.status(500).json({ status: "failed", message: "Email is already verified" });
            }

            const emailVerification = await EmailVerificationModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    await sendEmailVerifyOTP(req, existingUser);
                    return res.status(400).json({ status: "failed", message: "Invalid OTP,new OTP sent to your email" });
                }
                return res.status(400).json({ status: "failed", message: "Invalid OTP,new OTP sent to your email" });
            }

            // Check if OTP is expired
            const currentTime = new Date();
            const expiredTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expiredTime) {
                await sendEmailVerifyOTP(req, existingUser);
                return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
            }

            // OTP is valid and not expired,mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification data from database
            await EmailVerificationModel.deleteMany({ userId: existingUser._id });
            res.status(200).json({ status: "Success", message: "Email Verified" });


        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to Register, please try again later" });
        }
    }

    // User Login
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: "failed", message: "All field are required" });
            }

            // Find user by emai;
            const user = await UserModel.findOne({ email });

            // Check if User exists
            if (!user) {
                return res.status(404).json({ status: "failed", message: "User not Registered" });
            }

            // check if user exisits
            if (!user.is_verified) {
                return res.status(401).json({ status: "failed", message: "Your Account is not verified" });
            }

            // Compare Password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ status: "failed", message: "Invalid email or password" });
            }

            // Generate TOKEN
            const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);

            // Set Cookies
            setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

            //Send  success Response with Tokens
            res.status(200).json({
                user: { id: user._id, email: user.email, name: user.name, roles: user.roles[0] },
                status: "success",
                message: "Login Successful",
                access_token: accessToken,
                refresh_token: refreshToken,
                access_token_exp: accessTokenExp,
                is_auth: true
            })

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to login, please try again later" });
        }
    }

    // Get New Access Token OR Refresh Token
    static getNewAccessToken = async (req, res) => {
        try {
            // Get new access TOken using refresh Token
            const { newAccessToken,newRefreshToken,newAccessTokenExp,newRefreshTokenExp } = await refreshAccessToken(req, res);

            //Set New Tokens to Cookie
            setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp)

            res.status(200).json({
                status: "success",
                message: "New tokens generated",
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                access_token_exp: newAccessTokenExp,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "failed", message: "Unable to generate Access Token" });
        }
    }

    //Change Password

    //Profile

    // Send Password Reset Email

    //Password Reset

    //Logout

}

export default UserController;