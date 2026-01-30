import UserModel from "../models/User.js";
import bcrypt from 'bcryptjs'
import sendEmailVerifyOTP from "../utils/sendEmailVerifyOtp.js";
import EmailVerificationModel from "../models/EmailVerification.js";
import generateTokens from "../utils/generateTokens.js";
import setTokensCookies from "../utils/setTokensCookies.js";
import refreshAccessToken from "../utils/refreshAccessTooken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import transporter from "../config/emailConfig.js";
import jwt from "jsonwebtoken";
import PlatformSettingsModel from "../models/PlatformSettings.js";
import {
    buildAvailabilityPayload,
    validateAvailability,
} from "../utils/tutorAvailability.js";

const loadPlatformSettings = async () => {
    try {
        return await PlatformSettingsModel.findOne().lean();
    } catch (error) {
        return null;
    }
};

const normalizeStringList = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const parseOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

class UserController {

    //User Registration
    static userRegistration = async (req, res) => {
        try {
            const settings = await loadPlatformSettings();
            if (settings?.maintenance?.enabled) {
                return res.status(503).json({
                    status: "failed",
                    message: settings?.maintenance?.message || "Maintenance mode is active. Please try again later.",
                });
            }
            if (settings?.registration?.disabled) {
                return res.status(403).json({
                    status: "failed",
                    message: settings?.registration?.reason || "Registrations are temporarily disabled.",
                });
            }

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
                // If user exists but not verified, send new OTP
                if (!existingUser.is_verified) {
                    await sendEmailVerifyOTP(req, existingUser);
                    return res.status(409).json({ 
                        status: "failed", 
                        message: "Email exists but not verified. New verification code has been sent to your email." 
                    });
                }
                // If user exists and is verified, return error
                return res.status(409).json({ status: "failed", message: "Email already exists" });
            }

            // Generate salt and hash password
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashedPassword = await bcrypt.hash(password, salt);

            //Create new user
            const newUser = await new UserModel({ name, email, password: hashedPassword }).save();

            sendEmailVerifyOTP(req, newUser);

            //send success response
            res.status(201).json({
                status: "success",
                message: "Registration Success",
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

            const settings = await loadPlatformSettings();
            if (settings?.maintenance?.enabled && !user.roles.includes("admin")) {
                return res.status(503).json({
                    status: "failed",
                    message: settings?.maintenance?.message || "Maintenance mode is active. Please try again later.",
                });
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
                user: { 
                    id: user._id, 
                    email: user.email, 
                    name: user.name, 
                    roles: user.roles, 
                    onboardingStatus: user.onboardingStatus,
                    status: user.status
                },
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

    //Profile or Logged in User
    static userProfile = async (req, res) => {
        res.send({"user": req.user})
    }

    //Change Password
    static changePassword = async (req,res) => {
        try {
            const {password, password_confirmation} = req.body;
            console.log(req.body);
            if(!password || !password_confirmation){
                return res.status(400).json({status:"failed", message:"New and Confirm Password are requried!"})
            }

            if(password !== password_confirmation){
                return res.status(400).json({status:"failed", message:"New and Confirm Password Do not match."})
            }

            const salt = await bcrypt.genSalt(10);
            const  newHashPassword = await bcrypt.hash(password, salt);

            await UserModel.findByIdAndUpdate(req.user._id, {$set: { password: newHashPassword }});
            console.log(UserModel);
            res.status(200).json({status:"success", message:"Password Changed successfully!"});
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({status:"failed", message:"Unable to change password, Please Try again later!"})
        }
    }

    // Send Password Reset link via Email
    static sendUserPasswordResetEmail = async (req, res) => {
        try {
            const {email} = req.body;
            //check if email is provided
            if(!email){
                res.status(400).json({status:"failed", message:"Email Field is Required!"});
            }
            
            //find user by email from database
            const user = await UserModel.findOne({email});
            if(!user){
                res.status(404).json({status:"failed", message:"Email Doesn't Exist!"});
            }

            // Generate token for password reset
            const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '365d' });

            const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Password Reset Link",
                html: `<p> Hello ${user.name}, </p> <p> Please <a href="${resetLink}"> CLick here</a> to reset your password.`
            });

            res.status(200).json({status:"success", message:"Password reset link sent successfully, please check your email."})

        } catch (error) {
            console.error(error);
            return res.status(500).json({status:"failed", message:"Unable to send password reset email, Please Try again later!"});
        }
    }
    //Password Reset
    static userPasswordReset = async (req, res) => {
        try {
            const { password, password_confirmation} = req.body;
            const { id, token } = req.params;
            
            // Find user by ID
            const user = await UserModel.findById(id);
            if(!user) {
                return res.status(404).json({status:"failed", message:"User Not Found!"})  // Added return
            }
            
            // Validate Token
            const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            jwt.verify(token, new_secret);

            // check if password and password_confirmation are provided
            if(!password || !password_confirmation){
                return res.status(400).json({status:"failed", message:"New and Confirm Password are requried!"})
            }

            if(password !== password_confirmation){
                return res.status(400).json({status:"failed", message:"New and Confirm Password Do not match."})
            }

            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);

            await UserModel.findByIdAndUpdate(user._id, {$set: { password: newHashPassword }});

            res.status(200).json({status:"success", message:"Password Changed successfully!"});

        } catch (error) {
            console.error(error);  // Add error logging
            if (error.name === "TokenExpiredError"){
                return res.status(400).json({status:"failed", message:"Token expired, Please request a new password reset link."})
            }
            return res.status(500).json({status:"failed", message:"Unable to reset password, Please Try again later!"})
        }
    }
    // Update User Profile
    static updateUserProfile = async (req, res) => {
        try {
            const userId = req.user._id;
            const { 
                name, 
                bio, 
                hourlyRate, 
                experienceYears, 
                expertiseSubjects, 
                skills,
                qualification,
                professionalTitle,
                currentInstitution,
                teachingMode,
                achievements,
                availableDays,
                availableTimeSlots,
                city,
                country,
                languages,
            } = req.body;

            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({ status: "failed", message: "User not found" });
            }

            // Update basic info
            if (name !== undefined) {
                const trimmedName = String(name).trim();
                if (trimmedName) {
                    user.name = trimmedName;
                }
            }
            if (bio !== undefined) user.about = String(bio).trim(); // Updating root 'about'
            if (city !== undefined) user.city = String(city).trim();
            if (country !== undefined) user.country = String(country).trim();
            if (languages !== undefined) {
                user.languages = normalizeStringList(languages);
            }

            // Update Tutor Profile specific fields if user is a tutor
            if (user.roles.includes('tutor')) {
                if (!user.tutorProfile) {
                    user.tutorProfile = {};
                }

                if (bio !== undefined) user.tutorProfile.bio = String(bio).trim();

                const parsedRate = parseOptionalNumber(hourlyRate);
                if (parsedRate !== undefined) {
                    user.tutorProfile.hourlyRate = parsedRate;
                }

                const parsedExperience = parseOptionalNumber(experienceYears);
                if (parsedExperience !== undefined) {
                    user.tutorProfile.experienceYears = parsedExperience;
                }
                
                if (expertiseSubjects !== undefined) {
                    user.tutorProfile.expertiseSubjects = normalizeStringList(expertiseSubjects);
                }

                if (skills !== undefined) {
                    user.tutorProfile.skills = normalizeStringList(skills);
                }

                if (qualification !== undefined) user.tutorProfile.qualification = String(qualification).trim();
                if (professionalTitle !== undefined) user.tutorProfile.professionalTitle = String(professionalTitle).trim();
                if (currentInstitution !== undefined) user.tutorProfile.currentInstitution = String(currentInstitution).trim();
                if (teachingMode !== undefined) {
                    const normalizedMode =
                        typeof teachingMode === "string"
                            ? teachingMode.trim()
                            : teachingMode;
                    user.tutorProfile.teachingMode = normalizedMode || undefined;
                }
                if (achievements !== undefined) user.tutorProfile.achievements = String(achievements).trim();

                if (availableDays !== undefined || availableTimeSlots !== undefined) {
                    const currentDays = Array.isArray(user.tutorProfile.availableDays)
                        ? user.tutorProfile.availableDays
                        : [];
                    const currentSlots = Array.isArray(user.tutorProfile.availableTimeSlots)
                        ? user.tutorProfile.availableTimeSlots
                        : [];

                    const availabilityPayload = buildAvailabilityPayload(
                        availableDays !== undefined ? availableDays : currentDays,
                        availableTimeSlots !== undefined ? availableTimeSlots : currentSlots
                    );

                    const validationError = validateAvailability(
                        availabilityPayload.availableDays,
                        availabilityPayload.availableTimeSlots
                    );

                    if (validationError) {
                        return res.status(400).json({
                            status: "failed",
                            message: validationError,
                        });
                    }

                    user.tutorProfile.availableDays = availabilityPayload.availableDays;
                    user.tutorProfile.availableTimeSlots = availabilityPayload.availableTimeSlots;
                }
            }

            await user.save();

            res.status(200).json({
                status: "success",
                message: "Profile updated successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    tutorProfile: user.tutorProfile,
                    about: user.about,
                    city: user.city,
                    country: user.country,
                    languages: user.languages,
                }
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ status: "failed", message: "Unable to update profile" });
        }
    }

    //Logout
    static userLogout = async ( req, res) => {
        try {

            // Optionally, blacklist the refresh tokenin the database
            const refreshToken = req.cookies.refreshToken;
            await userRefreshTokenModel.findOneAndUpdate(
                {token: refreshToken},
                { $set: { blacklisted: true}}
            );

            // clear access token and refresh token from cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.clearCookie('is_auth');
            
            res.status(200).json({status: "success", message: "Logout Successful"});
        } catch (error) {
            console.error(error);
            res.status(500).json({status: "failed", message: "Unable to logout, Try again later!"});
        }
    }

}

export default UserController;
