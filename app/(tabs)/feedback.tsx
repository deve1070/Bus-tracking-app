import React from 'react';
import { View, Text } from 'react-native';
import FeedbackForm from '../../components/FeedbackForm';

export default function FeedbackScreen() {
  return (
    <View className="flex-1 bg-[#0f0D23]">
      <View className="bg-[#1A1D35] p-4 border-b border-[#2A2D45]">
        <Text className="text-white text-2xl font-bold">Feedback</Text>
        <Text className="text-[#ABB5D8] text-base mt-1">
          Help us improve our service by sharing your experience
        </Text>
      </View>
      <FeedbackForm />
    </View>
  );
} 