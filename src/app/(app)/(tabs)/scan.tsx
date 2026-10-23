import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { QR_PREFIX } from '@/lib/config';
import { useActiveMerchant } from '@/lib/session';
import { Body, Button, Notice, Screen, Title } from '@/ui/components';
import { radius, space, type, usePalette } from '@/ui/theme';

export default function Scan() {
  const c = usePalette();
  const membership = useActiveMerchant();
  const [permission, requestPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const locked = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      locked.current = false;
      setHint(null);
      return () => setFocused(false);
    }, []),
  );

  function onScanned(result: BarcodeScanningResult) {
    if (locked.current) return;
    if (!result.data.startsWith(QR_PREFIX)) {
      setHint('Il codice non è un QR PointEarner. Chiedi al consumatore di aprire «Il mio QR».');
      return;
    }
    locked.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.push({ pathname: '/customer', params: { token: result.data } });
  }

  if (!permission) return <Screen><Title>Scansiona</Title></Screen>;

  if (!permission.granted) {
    return (
      <Screen>
        <Title sub={membership?.merchants.name}>Scansiona il consumatore</Title>
        <Body>Per leggere il QR del consumatore è necessario l’accesso alla fotocamera. Le immagini non vengono salvate né trasmesse.</Body>
        {permission.canAskAgain ? (
          <Button title="Consenti la fotocamera" onPress={requestPermission} />
        ) : (
          <Notice tone="error">Accesso alla fotocamera negato. Attivalo dalle Impostazioni del telefono per PointEarner.</Notice>
        )}
      </Screen>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={{ padding: space.lg, gap: space.xs }}>
        <Text style={[type.title, { color: c.ink }]}>Scansiona</Text>
        <Body muted>{membership?.merchants.name} · inquadra il QR del consumatore</Body>
      </View>
      <View style={styles.cameraBox}>
        {focused ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onScanned}
          />
        ) : null}
        <View pointerEvents="none" style={[styles.frame, { borderColor: c.accent }]} />
      </View>
      <View style={{ padding: space.lg }}>{hint ? <Notice tone="error">{hint}</Notice> : null}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraBox: { flex: 1, marginHorizontal: space.lg, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  frame: { width: '65%', aspectRatio: 1, borderWidth: 3, borderRadius: radius.lg },
});
