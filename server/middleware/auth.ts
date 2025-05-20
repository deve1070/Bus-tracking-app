import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';



interface AuthRequest extends Request {
    user?:{id:string,role:string};}



    export const authenticate =(req:AuthRequest,res:Response,nexxt:NextFunction)=>{
        try{
            const token =req.headers.authorization?.split(' ')[1];
            if (!token){
                return res.status(401).json({error:'Unauthorized'});
            }
            const decoded =jwt.verify(token,process.env.JWT_SECRET as string) as {id:string,role:string};
            req.user =decoded;
            nexxt();
        }catch (error){
            res.status(401).json({error:'Unauthorized'});

        }
    };