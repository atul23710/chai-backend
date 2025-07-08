const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}

//we are a function as an input parameter here and going to make a call back so we need this syntax -- higher order function it is
//const asyncHandler = (fn) => {}
//const asyncHandler = (fn) => (() => {})
//const asyncHandler = (fn) => async () => {}

//this one is using the try-catch we can make it with promises as well above one
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }