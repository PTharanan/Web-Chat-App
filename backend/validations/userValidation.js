export const validateUsername = (req, res, next) => {
    // Body Safety: Prevents crash if req.body is undefined
    const { username } = req.body || {};

    if (typeof username !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Username must be a valid text string",
            data: null
        });
    }

    const cleanUsername = username.trim();

    if (!cleanUsername) {
        return res.status(400).json({
            status: "error",
            message: "Username cannot be empty",
            data: null
        });
    }

    if (cleanUsername.length <= 3 || cleanUsername.length >= 30) {
        return res.status(400).json({
            status: "error",
            message: "Username must be between 4 and 29 characters",
            data: null
        });
    }

    // Regex Check: Only letters, numbers, and underscores allowed
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({
            status: "error",
            message: "Username can only contain letters, numbers, and underscores",
            data: null
        });
    }

    // Secure Data Transfer: Pass only the sanitized username to the controller & Merge with existing validatedData
    req.validatedData = {
        ...req.validatedData,
        username: cleanUsername
    };

    next();
};

export const validatePassword = (req, res, next) => {
    // Body Safety: Prevents crash if req.body is undefined
    const { password } = req.body || {};

    if (typeof password !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Password must be a valid text string",
            data: null
        });
    }

    const cleanPassword = password.trim();

    if (!cleanPassword) {
        return res.status(400).json({
            status: "error",
            message: "Password is required",
            data: null
        });
    }

    // Regex Pattern (At least 1 uppercase, 1 number [0-9], length 8-16)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,16}$/;

    if (!passwordRegex.test(cleanPassword)) {
        return res.status(400).json({
            status: "error",
            message: "Password must be 8-16 characters long, contain at least one uppercase letter and one number",
            data: null
        });
    }

    // Merge with existing validatedData (Prevents overwriting username!)
    req.validatedData = {
        ...req.validatedData,
        password: cleanPassword
    };

    next();
};