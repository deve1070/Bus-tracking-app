import React, { useState } from 'react'
import { ActivityIndicator, Button, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

const Settings = () => {
  const [checkoutUrl, setCheckoutUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)

  const initiatePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer CHASECK_TEST-0mOP03fPlAfM8u9xpdxUX3pwAAjava5W',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 50,
          currency: 'ETB',
          email: 'bseyoum003@gmail.com',
          first_name: 'Biruk',
          last_name: 'Seyoum',
          phone_number: '0912345678',
          tx_ref: `txn-${Date.now()}`,
          callback_url: 'https://example.com/callback', // optional
          return_url: 'https://example.com/payment-success',
          customization: {
        title: 'Pay',
        description: 'Pay with Chapa - TeleBirr or CBE Birr',
          }
        })
      })
      console.log("the data i got is", res);
      const data = await res.json()
      if (!res.ok) {
        console.error('Payment API error:', data)
        setLoading(false)
        return
      }
      console.log("the data",data);

      const url = data?.data?.checkout_url
      setCheckoutUrl(url)
    } catch (err) {
      console.error('Payment failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // Watch for return_url in the WebView
  const handleWebViewNavigation = (navState:any) => {
    const { url } = navState
    if (url.includes('https://example.com/payment-success')) {
      setCheckoutUrl(null)      // Close WebView
      setPaymentDone(true)      // Show thank-you message
    }
  }

  if (checkoutUrl) {
    return (
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleWebViewNavigation}
        startInLoadingState
        style={{ flex: 1 }}
      />
    )
  }

  return (
    <View className="bg-primary min-h-screen items-center justify-center p-4">
      {paymentDone ? (
        <Text className="text-white font-extrabold text-xl">🎉 Thank you for paying!</Text>
      ) : (
        <>
          <Text className="text-white font-extrabold text-2xl mb-4">Payments</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Button title="Pay with TeleBirr / CBE Birr" onPress={initiatePayment} />
          )}
        </>
      )}
    </View>
  )
}

export default Settings
