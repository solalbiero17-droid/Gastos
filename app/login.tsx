import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../src/context/SessionContext';
import { TextField } from '../src/components/TextField';
import { colors, radii } from '../src/constants/theme';
import { isValidEmail } from '../src/utils/format';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginWithGoogle, loginWithEmail } = useSession();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const emailOk = isValidEmail(email);

  const handleEmail = () => {
    if (!emailOk) {
      setError('Escribí un mail válido.');
      return;
    }
    setError('');
    loginWithEmail(email.trim());
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>$</Text>
          </View>
          <Text style={styles.title}>Mis Gastos</Text>
          <Text style={styles.subtitle}>Controlá tus gastos, límites y ahorros en un solo lugar.</Text>
        </View>

        <View style={styles.form}>
          <Pressable onPress={loginWithGoogle} style={styles.googleButton}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleLabel}>Continuar con Google</Text>
          </Pressable>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorLabel}>o con tu mail</Text>
            <View style={styles.separatorLine} />
          </View>

          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="tumail@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            align="center"
            style={styles.pillInput}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleEmail}
            style={[styles.continueButton, { backgroundColor: emailOk ? colors.ink : colors.disabled }]}
          >
            <Text style={styles.continueLabel}>Continuar</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Tus datos quedan guardados en tu dispositivo.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 34,
    fontFamily: 'Nunito_900Black',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: colors.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleG: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: colors.googleBlue,
  },
  googleLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: colors.ink,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2ddd3',
  },
  separatorLabel: {
    fontSize: 11.5,
    fontFamily: 'Nunito_700Bold',
    color: colors.tabInactive,
  },
  pillInput: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    fontSize: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  error: {
    fontSize: 12.5,
    fontFamily: 'Nunito_700Bold',
    color: colors.redSoftText,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueLabel: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
  },
  footer: {
    fontSize: 11.5,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.tabInactive,
    textAlign: 'center',
  },
});
