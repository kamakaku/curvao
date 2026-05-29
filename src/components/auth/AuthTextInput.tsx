import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { curvao } from '@/src/theme/curvaoTheme';

type AuthTextInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthTextInput({ label, error, style, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(167,163,154,0.4)"
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: curvao.colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(216,170,77,0.15)',
    borderRadius: 8,
    height: 54,
  },
  inputContainerError: {
    borderColor: curvao.colors.danger,
  },
  input: {
    color: curvao.colors.text,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
    paddingHorizontal: 16,
  },
  errorText: {
    color: curvao.colors.danger,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
});
