import { error } from "console";

const asyncHandler= async(requesthandler)=>
{
    (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}


// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(func)=>async()=>{}
// const asyncHandler=(fn)=>async(req,res,next)=>
// {
//     try{
//         await fn(req,res,next);
//     }
//     catch(error){

//     }
// }



export default asyncHandler;


