import http from 'http';
import { Server,Socket } from 'socket.io';
import app from './app';
import { Bus } from './models';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket:Socket) => {
  console.log('Client connected');
  socket.on('join-bus-tracking', async (busId:string)=>{
    socket.join(busId);
    console.log(`Client joined bus tracking for bus ID:${busId}`);
    const bus =await Bus.findById(busId);
    if(bus){
      io.to(busId).emit('bus-location-update', {
        busId,
        location:{lat:bus.location.coordinates[1],lng:bus.location.coordinates[0]}
        });
    }
  });

  socket.on('update-bus-location', async ({busId, lat, lng}: {busId: string, lat: number, lng: number}) => {
    const bus = await Bus.findByIdAndUpdate(
      busId, 
      { location:{type:'Point',coordinates:[lng, lat] }},
       { new: true });

    if (bus) {
      io.to(busId).emit('bus-location-update', {
        busId,
        location: { lat: bus.location.coordinates[1], lng: bus.location.coordinates[0] }
      });
    }
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export {io};
