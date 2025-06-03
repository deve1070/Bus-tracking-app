import StatsCard from '@/components/CardItem'
import { API_URL } from '../../config'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import io from 'socket.io-client'

interface Bus {
  deviceId: string
  busNumber: string
  routeNumber: string
  status: string
  location: {
    lat: number
    lng: number
  }
  speed: number
  heading: number
  lastUpdate: string
}

const Buses = () => {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBuses = async () => {
    try {
      setError(null)
      // First try to get initial data from the WebSocket server
      const response = await fetch(`${API_URL}/api/bus/status`)
      if (!response.ok) {
        throw new Error('Failed to fetch buses')
      }
      const data = await response.json()
      setBuses(data)
    } catch (err) {
      console.error('Error fetching buses:', err)
      // Don't show error if we have WebSocket data
      if (buses.length === 0) {
        setError('Failed to load buses. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBuses()

    // Set up WebSocket connection
    const socket = io(API_URL)

    socket.on('connect', () => {
      console.log('Connected to socket server')
    })

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      if (buses.length === 0) {
        setError('Failed to connect to server. Please check your connection.')
      }
    })

    // Listen for bus location updates
    socket.on('busLocationUpdate', (data: Bus[]) => {
      console.log('Received bus location update:', data)
      setBuses(data)
      setError(null) // Clear any previous errors
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchBuses()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#22c55e' // green-600
      case 'inactive':
        return '#4b5563' // gray-600
      case 'maintenance':
        return '#dc2626' // red-600
      default:
        return '#2563eb' // blue-600
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'activity'
      case 'inactive':
        return 'clock'
      case 'maintenance':
        return 'right'
      default:
        return 'bus'
    }
  }

  if (loading && buses.length === 0) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    )
  }

  if (error && buses.length === 0) {
    return (
      <View className="flex-1 bg-primary justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable 
          onPress={fetchBuses}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="bg-primary min-h-screen">
      <Text className="text-white font-extrabold text-2xl text-center mt-12 mb-6">
        Available Buses
      </Text>
      
      <ScrollView 
        className="px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      >
        {buses.map((bus) => (
          <Pressable 
            key={bus.deviceId}
            className="mb-4"
            onPress={() => console.log('Bus selected:', bus.busNumber)}
          >
            <StatsCard
              title={`Bus ${bus.busNumber}`}
              icon={getStatusIcon(bus.status)}
              value={`Route: ${bus.routeNumber}`}
              size={18}
              iconColor={getStatusColor(bus.status)}
              subtitle={
                <View className="mt-2">
                  <Text className="text-gray-400 text-sm">
                    Speed: {bus.speed.toFixed(1)} km/h
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Last update: {new Date(bus.lastUpdate).toLocaleTimeString()}
                  </Text>
                </View>
              }
            />
          </Pressable>
        ))}

        {buses.length === 0 && (
          <View className="items-center justify-center py-8">
            <Ionicons name="bus" size={48} color="#4b5563" />
            <Text className="text-gray-400 mt-4 text-center">
              No buses available at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Buses