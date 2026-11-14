export default class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.status = statusCode < 400 ? "success" : "error";
        this.message = message;
        this.data = data;
    }
}