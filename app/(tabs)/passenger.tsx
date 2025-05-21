import StatsCard from '@/components/CardItem';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const PassengerScreen = () => {
  const passengers = [
    { passenger: 'John Doe', ticket: 'A123', destination: 'Central', status: 'Waiting', schedule: '10:00 AM' },
    { passenger: 'Jane Smith', ticket: 'B456', destination: 'West End', status: 'Boarding', schedule: '10:30 AM' },
    { passenger: 'Alice Lee', ticket: 'C789', destination: 'North Point', status: 'Departed', schedule: '11:00 AM' },
  ];

  return (
    <ScrollView 
      className="bg-primary flex-1"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} // Added extra padding
      alwaysBounceVertical={true} // Allows bouncing even when content is small
    >
      {/* Header Section */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-white font-extrabold text-2xl text-center">Passenger Management</Text>
        <Text className="text-white font-semibold text-center mt-2">
          Track and manage passengers at your station
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="px-4 space-y-3 mb-6"> {/* Added margin bottom */}
        <StatsCard 
          title='Total Waiting' 
          icon='users' 
          value="0" 
        />
        <StatsCard 
          title='Total Boarding' 
          icon='right' 
          value="0" 
        />
        <StatsCard 
          title='Total Departed' 
          icon='users' 
          value="0" 
        />
        <StatsCard 
          title='Peak Hour' 
          icon='clock' 
          value="0" 
        />
      </View>

      {/* Passenger Table */}
      <View className="bg-white/10 rounded-lg mx-4 mb-8 p-4"> {/* Added margin bottom */}
        {/* Table Header */}
        <View className="flex-row mb-3">
          <Text numberOfLines={1} className="flex-1 text-white font-bold text-xs w-1/5 px-1">Passenger</Text>
          <Text numberOfLines={1} className="flex-1 text-white font-bold text-xs w-1/5 px-1">Ticket</Text>
          <Text numberOfLines={1} className="flex-1 text-white font-bold text-xs w-1/5 px-1">Destination</Text>
          <Text numberOfLines={1} className="flex-1 text-white font-bold text-xs w-1/5 px-1">Status</Text>
          <Text numberOfLines={1} className="flex-1 text-white font-bold text-xs w-1/5 px-1">Schedule</Text>
        </View>
        
        {/* Table Rows */}
        {passengers.map((item, idx) => (
          <View 
            key={idx} 
            className="flex-row py-3 border-b border-white/10 last:border-b-0"
          >
            <Text numberOfLines={1} className="flex-1 text-white text-xs w-1/5 px-1">{item.passenger}</Text>
            <Text numberOfLines={1} className="flex-1 text-white text-xs w-1/5 px-1">{item.ticket}</Text>
            <Text numberOfLines={1} className="flex-1 text-white text-xs w-1/5 px-1">{item.destination}</Text>
            <Text 
              numberOfLines={1}
              className={`flex-1 text-xs w-1/5 px-1 ${
                item.status === 'Waiting' ? 'text-yellow-400' : 
                item.status === 'Boarding' ? 'text-green-400' : 
                'text-gray-300'
              }`}
            >
              {item.status}
            </Text>
            <Text numberOfLines={1} className="flex-1 text-white text-xs w-1/5 px-1">{item.schedule}</Text>
          </View>
        ))}
      </View>

      {/* Empty space to ensure scrolling works */}
      <View className="h-20" />
    </ScrollView>
  );
};

export default PassengerScreen;