import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { API_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from '../config';

type FeedbackType = 'COMPLAINT' | 'SUGGESTION' | 'PRAISE';
type FeedbackCategory = 'SERVICE' | 'SAFETY' | 'CLEANLINESS' | 'DRIVER' | 'OTHER';

const feedbackCategories: FeedbackCategory[] = ['SERVICE', 'SAFETY', 'CLEANLINESS', 'DRIVER', 'OTHER'];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function FeedbackForm() {
  const { user } = useAuth();
  const [type, setType] = useState<FeedbackType>('SUGGESTION');
  const [category, setCategory] = useState<FeedbackCategory>('SERVICE');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (retryCount = 0): Promise<Response> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          type,
          category,
          message,
          userId: user?.id,
          deviceId: user?.deviceId,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      }
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    setIsSubmitting(true);
    let retryCount = 0;
    let success = false;

    while (retryCount < MAX_RETRIES && !success) {
      try {
        const response = await submitFeedback(retryCount);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit feedback');
        }

        success = true;
        Alert.alert('Success', 'Thank you for your feedback!');
        setMessage('');
        setType('SUGGESTION');
        setCategory('SERVICE');
      } catch (error: any) {
        console.error('Feedback submission error:', error);
        
        if (retryCount < MAX_RETRIES - 1) {
          retryCount++;
          await sleep(RETRY_DELAY);
          continue;
        }

        Alert.alert(
          'Error',
          error.message || 'Network error. Please check your internet connection and try again.'
        );
      }
    }

    setIsSubmitting(false);
  };

  const pickerStyle = Platform.select({
    ios: {
      backgroundColor: '#1A1D35',
      color: 'white',
    },
    android: {
      backgroundColor: '#1A1D35',
      color: 'white',
    },
  });

  return (
    <ScrollView className="flex-1 bg-[#0f0D23] p-4">
      <View className="space-y-4">
        <View>
          <Text className="text-lg font-semibold mb-2 text-white">Feedback Type</Text>
          <View className="border border-[#1A1D35] rounded-lg overflow-hidden bg-[#1A1D35]">
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value as FeedbackType)}
              style={pickerStyle}
              dropdownIconColor="white"
              mode="dropdown"
            >
              <Picker.Item 
                label="Complaint" 
                value="COMPLAINT" 
                color="white"
                style={{ backgroundColor: '#1A1D35' }}
              />
              <Picker.Item 
                label="Suggestion" 
                value="SUGGESTION" 
                color="white"
                style={{ backgroundColor: '#1A1D35' }}
              />
              <Picker.Item 
                label="Praise" 
                value="PRAISE" 
                color="white"
                style={{ backgroundColor: '#1A1D35' }}
              />
            </Picker>
          </View>
        </View>

        <View>
          <Text className="text-lg font-semibold mb-2 text-white">Category</Text>
          <View className="border border-[#1A1D35] rounded-lg overflow-hidden bg-[#1A1D35]">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as FeedbackCategory)}
              style={pickerStyle}
              dropdownIconColor="white"
              mode="dropdown"
            >
              {feedbackCategories.map((cat) => (
                <Picker.Item 
                  key={cat} 
                  label={cat.charAt(0) + cat.slice(1).toLowerCase()} 
                  value={cat} 
                  color="white"
                  style={{ backgroundColor: '#1A1D35' }}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View>
          <Text className="text-lg font-semibold mb-2 text-white">Message</Text>
          <TextInput
            className="border border-[#1A1D35] rounded-lg p-3 min-h-[120px] text-base bg-[#1A1D35] text-white"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
            placeholder="Please describe your feedback in detail..."
            placeholderTextColor="#ABB5D8"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`bg-[#4285F4] py-3 rounded-lg ${isSubmitting ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 