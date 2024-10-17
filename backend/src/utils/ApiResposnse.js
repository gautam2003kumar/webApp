class ApiResponse{
    constructor(statusCode,data, message = "Success" ){
        this.statusCode = statusCode
        this.message = message
        this.sucess = statusCode < 400
    }
}