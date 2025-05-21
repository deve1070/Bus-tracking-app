import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex">
      {/* Background gradient overlay */}
      <View className="absolute inset-0 bg-black opacity-80" />

      {/* Main content */}
      <View className="flex-1 justify-center items-center p-6 z-10">
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-teal-400 text-6xl font-bold mb-2">BT</Text>
          <Text className="text-white text-2xl font-bold">BusTracker</Text>
        </View>

        {/* Headline */}
        <View className="items-center mb-16">
          <Text className="text-white text-4xl font-bold text-center mb-4">Track Your Bus</Text>
          <Text className="text-gray-300 text-center text-base mb-8">
            Real-time tracking and notifications for your daily commute
          </Text>
        </View>

        {/* Features */}
        <View className="w-full mb-16">
          {[ 
            "Live GPS Tracking", 
            "Arrival Notifications", 
            "Optimal Route Planning" 
          ].map((feature, i) => (
            <View key={i} className="flex-row items-center mb-4 bg-white/10 p-4 rounded-lg">
              <View className="w-8 h-8 rounded-full bg-teal-500 items-center justify-center mr-3">
                <Text className="text-white font-bold">{i + 1}</Text>
              </View>
              <Text className="text-white text-base">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="w-4/5 h-14 bg-teal-500 rounded-full items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
