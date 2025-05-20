import { Request,Response } from "express";
import { Bus } from "../models";
import { Types } from "mongoose";
import { io } from "../server";


interface CreateBuseRequest extends Request{
    body:{
        number:string;
        routeId?:string;
        status?:'active'|'inactive';
        latitude?:number;
        longitude?:number;
        driverId?:string;
    };

    user?:{id:string;role:string};
};

export const CreateBus=async(req:CreateBuseRequest,res:Response)=>{
    try {
        if (!req.user || !['MainAdmin'].includes(req.user.role)){
            return res.status(403).json({error:'Unauthorized:Main admin access required'});
        }
        const {number,routeId,status,latitude,longitude,driverId}=req.body;

        if (!number){
            return res.status(400).json({error:'Bus number is required'});

        }
        const existingBus=await Bus.findOne({number});
        if(existingBus){
            return res.status(400).json({error:'Bus number already exist'});

        }
        const busData:any ={number};
        if (routeId){
            if (!Types.ObjectId.isValid(routeId)){
                return res.status(400).json({error:'Invalid route ID'});

            }
            busData.route=routeId
        }
        if (status){
            busData.status= status;
        
        }
        if (latitude !==undefined && longitude !== undefined){
            busData.location={type:'Point',coordinates:[longitude,latitude]}
        }
        if(driverId){
            if (!Types.ObjectId.isValid(driverId)){
                return res.status(400).json({error:'Invalid driver ID'});

            }
            busData.driver =driverId
        }
        

        const bus=new Bus(busData)
        await bus.save()
    
       
        io.emit('bus-created',{
            busId:bus._id,
            number:bus.number,
            status:bus.status,
            location:bus.location?{lat:bus.location.coordinates[1],lng:bus.location.coordinates[0]}:null
        });

        res.status(201).json(bus);
    }catch (error){
        console.error('Create bus error',error);
        res.status(500).json({error:'Failed to create bus'});

    
    }
};