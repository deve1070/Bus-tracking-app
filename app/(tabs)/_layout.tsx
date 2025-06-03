import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

type TabIconProps = {
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
  inactiveColor?: string;
};

const TabIcon = ({ 
  focused, 
  iconName, 
  title, 
  color = '#4285F4', 
  inactiveColor = '#ABB5D8' 
}: TabIconProps) => {
  return (
    <View className="items-center justify-center py-1">
      <Ionicons 
        name={iconName} 
        size={22} 
        color={focused ? color : inactiveColor} 
      />
      {focused && (
        <Text className="mt-1 text-[10px] font-medium text-white no-wrap">
          {title}
        </Text>
      )}
    </View>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      initialRouteName='home'
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 16,
          paddingHorizontal: 8,
          marginBottom: 36,
          height: 60,
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#1A1D35',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          height: 48,
          marginVertical: 6,
        }
      }}
    >
      <Tabs.Screen 
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="home" 
              title="Home" 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="buses" 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="bus" 
              title="Buses" 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="simulator" 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="navigate" 
              title="Simulator" 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="feedback" 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="chatbubble-ellipses" 
              title="Feedback" 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="notifications" 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="notifications" 
              title="Alerts" 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="settings" 
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="settings" 
              title="Settings" 
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;