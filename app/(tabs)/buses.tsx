import StatsCard from '@/components/CardItem'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

const Buses = () => {
  return (
   <View className="bg-primary min-h-screen text-white mt-7">
         <Text className="flex justify-center ml-[25%] mt-12 text-white font-extrabold text-2xl">Buses</Text>
         <Pressable onPress={()=>console.log("i am clicked")}>
           <StatsCard title="Bus #1" icon="clock" value="Route: City Center-Airport" size={18}/>

         </Pressable>
        <Pressable onPress={()=>console.log("i am clicked")}>
           <StatsCard title="Bus #2" icon="clock" value="Route: City Center-Airport" size={18}/>

         </Pressable>
          <Pressable onPress={()=>console.log("i am clicked")}>
           <StatsCard title="Bus #3" icon="clock" value="Route: City Center-Airport" size={18}/>

         </Pressable>
     </View>
  )
}

export default Buses