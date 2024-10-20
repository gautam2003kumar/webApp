const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next)
    }
}

export {asyncHandler}








// const asyncHandler = (fn) => {async (req, req, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         resizeBy.status(err.code || 500).json({
//             success: false,
//             massage: err.massage
//         })
//     }
// }}