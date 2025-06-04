import { Activity, Bus, Check, Clock, DollarSign, Users } from "lucide-react-native"; // Make sure to install lucide-react-native
import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

type StatsCardProps = {
  title: string;
  value: string | number;
  size?: number;
  icon: "bus" | "users" | "dollar-sign" | "activity" | "right" | "clock";
  className?: string;
  iconColor?: string;
  subtitle?: React.ReactNode;
};

const Correct = Check;
const iconMap = {
  "bus": Bus,
  "users": Users,
  "dollar-sign": DollarSign,
  "activity": Activity,
  "right": Correct,
  "clock": Clock,
};
const StatsCard = ({ title, value, icon, size, iconColor, subtitle }: StatsCardProps) => {
 const theme = useColorScheme();
  const isDarkTheme = theme === 'dark';
  const Icon = iconMap[icon];
  
  const themedStyles = styles(isDarkTheme);
  return (
    <View style={themedStyles.card}>
      <View style={themedStyles.contentContainer}>
        <View style={[themedStyles.iconContainer, iconColor && { backgroundColor: `${iconColor}20` }]}>
        <Icon
        size={size ?? 24}
            color={iconColor ?? (isDarkTheme ? "#3b82f6" : "#3b82f6")}
        />
      </View>
        <View style={themedStyles.textContainer}>
        <Text style={themedStyles.title}>{title}</Text>
        <Text style={[themedStyles.value, { fontSize: size ?? 24 }]}>{String(value)}</Text>
          {subtitle}
      </View>
      </View>
    </View>
  );
};

const styles = (isDarkTheme: boolean) => StyleSheet.create({
  card: {
    backgroundColor: isDarkTheme
      ? 'rgba(255,255,255,0.25)' // Lighter glass effect for dark theme
      : 'rgba(255,255,255,0.25)', // Default glass effect
    borderRadius: 16,
    padding: 24,
    margin: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // bg-primary/20
    borderRadius: 12,
    padding: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280', // text-muted-foreground
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Base color
  },
});

export default StatsCard;