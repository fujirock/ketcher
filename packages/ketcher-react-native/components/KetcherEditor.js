import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const ketcherHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ketcher</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #ketcher-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
    </style>
    <!-- Ketcher dependencies -->
    <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@epam/ketcher/dist/ketcher.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@epam/ketcher/dist/ketcher.css">
</head>
<body>
    <div id="ketcher-container"></div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const ketcherWindow = window.ketcher;
            
            ketcherWindow.editor.init(document.getElementById('ketcher-container'));
            
            window.addEventListener('message', function(event) {
                const message = JSON.parse(event.data);
                
                if (message.type === 'getStructure') {
                    const structure = ketcherWindow.editor.getStructure();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'structure',
                        data: structure
                    }));
                } else if (message.type === 'setStructure') {
                    ketcherWindow.editor.setStructure(message.data);
                }
            });
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready'
                }));
            }
        });
    </script>
</body>
</html>
`;

const KetcherEditor = () => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'ready') {
        console.log('Ketcher is ready');
        setIsLoading(false);
      } else if (message.type === 'structure') {
        console.log('Received structure:', message.data);
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  };

  const getStructure = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'getStructure'
      }));
    }
  };

  const setStructure = (structureData) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'setStructure',
        data: structureData
      }));
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading Ketcher editor...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: ketcherHtml }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        originWhitelist={['*']}
        onLoad={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError('Failed to load Ketcher editor');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});

export default KetcherEditor;
