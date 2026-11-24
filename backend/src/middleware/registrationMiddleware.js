import ApiResponse from "../utils/ApiResponse.js";
import { ENV } from "../utils/env.js"

export const registrationGuard = (req, res, next) => {
    if (ENV.ALLOW_REGISTRATION !== "true") {
        return res
            .status(403)
            .json(new ApiResponse(403, "Registration is currently disabled"));
    }

    return next();
};
