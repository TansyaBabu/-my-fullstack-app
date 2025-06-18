const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
            console.log('Password not modified, skipping hashing');
            return next();
        }

        console.log('Hashing password for user:', this.email);
        console.log('Original password:', this.password);
        
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        console.log('Generated salt:', salt);
        
        // Hash the password along with the new salt
        const hashedPassword = await bcrypt.hash(this.password, salt);
        console.log('Hashed password:', hashedPassword);
        
        // Replace the plain text password with the hash
        this.password = hashedPassword;
        console.log('Password hashed successfully');
        
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    try {
        console.log('Comparing passwords for user:', this.email);
        console.log('Entered password:', enteredPassword);
        console.log('Stored hashed password:', this.password);
        
        // Compare the entered password with the stored hash
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        console.log('Password comparison result:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Only create the model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 