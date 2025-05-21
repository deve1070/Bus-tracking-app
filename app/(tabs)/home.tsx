import StatsCard from '@/components/CardItem';
import React from 'react';
import { Image, Text, View } from 'react-native';


const Home = () => {
  return (
    <View className="bg-primary min-h-screen">
      {/* Header */}
      <Text className="text-white font-extrabold text-2xl ml-[25%] mt-12 pb-7">
        Station Dashboard
      </Text>

      {/* Stats Cards */}
      <View className="space-y-4 mx-4">
        <StatsCard
          title="Active Buses" 
          value="0" 
          icon="bus"
          className="bg-[#F5F6FA] rounded-xl p-4"
        />
        <StatsCard 
          title="Today's Passengers" 
          value="0" 
          icon="users"
          className="bg-[#F5F6FA] rounded-xl p-4"
        />
        <StatsCard 
          title="Today's Revenue" 
          value="0" 
          icon="dollar-sign"
          className="bg-[#F5F6FA] rounded-xl p-4"
        />
      </View>

      {/* Recent Activity */}
      <Text className="text-white font-extrabold text-2xl ml-[25%] mt-8 mb-4">
        Recent Activity
      </Text>
      
      <View className="bg-white mx-4 p-4 rounded-xl">
        <View className="flex flex-row items-center">
          <Image 
            source={require('../../assets/images/time.png')} 
            className="w-10 h-10 mr-3"
          />
          <View>
            <Text className="font-bold text-base">
              Bus ABC123 arrived at platform 2
            </Text>
            <Text className="font-semibold text-sm text-gray-500">
              2 minutes ago
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Home;