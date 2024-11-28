import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; 
    next(); 
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
