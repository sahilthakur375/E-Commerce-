import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';  
import User from '../models/User.js';
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const uploadDir = path.join(__dirname, '../public');


const validatePassword = (password) => {
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!passwordPattern.test(password)) {
    return "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, digit, and special character.";
  }
  return true;
};

export const signup = async (req, res) => {
  const { name, email, password, deviceToken } = req.body; 

  const passwordValidation = validatePassword(password);
  if (passwordValidation !== true) {
    return res.status(400).json({ message: passwordValidation });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const deviceID = uuidv4(); 

    const user = new User({
      name,
      email,
      password: hashedPassword,
      deviceID,  
      deviceToken,

    });
    
    await user.save();

    res.status(201).json({ message: 'User created successfully', deviceID, deviceToken }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password, deviceToken } = req.body;  

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (deviceToken) {
      user.deviceToken = deviceToken;  
      await user.save();  
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ user, token, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    user.resetOtp = otp;
    user.resetOtpExpiration = otpExpiration;
    await user.save();

    res.status(200).json({
      message: 'OTP generated successfully. Use it to reset your password.',
      otp: otp,
      expiresIn: otpExpiration,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const passwordValidation = validatePassword(newPassword);
  if (passwordValidation !== true) {
    return res.status(400).json({ message: passwordValidation });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetOtpExpiration < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiration = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const fileuplaod =async(req, res, next)=>{
  try {
    
    const uploadedFile = req.files.image;
console.log(uploadedFile.name)

    const uploadPath = path.join(uploadDir, uploadedFile.name);
  
    uploadedFile.mv(uploadPath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
  
      res.send(`File uploaded successfully: ${uploadedFile.name}`);
    });

  } catch (error) {
    console.error(error,'=====>>>>')
  }
}
