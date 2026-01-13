import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { Paths, Directory } from 'expo-file-system';
import { setup, sendRpc } from '@mrimmortal09/react-native-fedimint-client';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [rpcResponse, setRpcResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeFedimint();
  }, []);

  const initializeFedimint = async () => {
    try {
      // Get the document directory path and strip the file:// scheme for Expo
      const documentDir = Paths.document;

      // Strip file:// scheme as required by the package for Expo
      const dbPath = documentDir.uri.replace('file://', '') + '/fedimint_db';

      // Ensure the fedimint_db directory exists
      const fedimintDir = new Directory(documentDir, 'fedimint_db');
      if (!fedimintDir.exists) {
        fedimintDir.create();
      }

      setStatus(`Setting up with db path: ${dbPath}`);

      // Initialize the fedimint client
      setup(dbPath);

      setIsInitialized(true);
      setStatus('Fedimint client initialized successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Initialization error: ${errorMessage}`);
      setStatus('Failed to initialize');
    }
  };

  const checkMnemonic = async () => {
    if (!isInitialized) {
      setError('Client not initialized');
      return;
    }

    try {
      setRpcResponse(null);
      setError(null);

      const response = await sendRpc(
        JSON.stringify({
          request_id: '1',
          method: 'has_mnemonic_set',
        })
      );

      setRpcResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`RPC error: ${errorMessage}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fedimint React Native Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.status, error ? styles.errorText : null]}>
          {error || status}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Check Mnemonic Status"
          onPress={checkMnemonic}
          disabled={!isInitialized}
        />
      </View>

      {rpcResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.label}>RPC Response:</Text>
          <Text style={styles.response}>{rpcResponse}</Text>
        </View>
      )}

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#d32f2f',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  response: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
