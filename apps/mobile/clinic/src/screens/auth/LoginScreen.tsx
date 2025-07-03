// apps/mobile/src/screens/auth/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import {
  Button,
  TextInput,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppDispatch, RootState } from '@rehab/shared';
import { sendOtp, clearError } from '@rehab/shared/store/slices/authSlice';
import { colors, typography } from '@rehab/shared/theme';
import { validatePhoneNumber } from '../../utils/validators';
import GradientBackground from '../../components/ui/GradientBackground';
import AnimatedCard from '../../components/ui/AnimatedCard';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { loading, error, otpSent, phoneNumber } = useSelector(
    (state: RootState) => state.auth
  );

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const phoneInputRef = useRef<any>(null);

  // Animation values
  const logoScale = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    logoScale.value = withSpring(1, { damping: 15 });
    formTranslateY.value = withTiming(0, { duration: 800 });
    formOpacity.value = withTiming(1, { duration: 1000 });

    // Clear error on unmount
    return () => {
      dispatch(clearError());
    };
  }, []);

  useEffect(() => {
    if (otpSent && phoneNumber) {
      navigation.navigate('OTPVerification', { phone: phoneNumber });
    }
  }, [otpSent, phoneNumber]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const handleSendOTP = async () => {
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Invalid phone number');
      return;
    }

    setPhoneError('');

    // Format phone number with country code if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    dispatch(sendOtp({ phone: formattedPhone }));
  };

  const handlePhoneChange = (text: string) => {
    // Allow only numbers and + at the beginning
    const cleaned = text.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+') || cleaned === '') {
      setPhone(cleaned);
    } else {
      setPhone(cleaned.replace(/^\+/, ''));
    }

    if (phoneError) {
      setPhoneError('');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo and Title */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <View style={styles.logoWrapper}>
                <Icon
                  name="medical-bag"
                  size={60}
                  color={colors.primary[500]}
                />
              </View>
              <Text style={styles.title}>RehabOS</Text>
              <Text style={styles.subtitle}>
                Your Complete Clinic Management Solution
              </Text>
            </Animated.View>

            {/* Login Form */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <AnimatedCard delay={300}>
                <View style={styles.formHeader}>
                  <Icon name="lock" size={24} color={colors.primary[600]} />
                  <Text style={styles.formTitle}>Secure Login</Text>
                </View>

                <Text style={styles.formDescription}>
                  Enter your registered phone number to receive a one-time
                  password
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    ref={phoneInputRef}
                    mode="outlined"
                    label="Phone Number"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="+91 98765 43210"
                    keyboardType="phone-pad"
                    maxLength={15}
                    error={!!phoneError || !!error}
                    outlineColor={colors.neutral[300]}
                    activeOutlineColor={colors.primary[500]}
                    theme={{
                      colors: {
                        primary: colors.primary[500],
                        error: colors.error,
                      },
                      roundness: 12,
                    }}
                    left={
                      <TextInput.Icon
                        icon="phone"
                        color={
                          phoneError || error
                            ? colors.error
                            : colors.primary[500]
                        }
                      />
                    }
                    style={styles.input}
                  />

                  {(phoneError || error) && (
                    <HelperText
                      type="error"
                      visible={true}
                      style={styles.errorText}
                    >
                      {phoneError || error}
                    </HelperText>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={loading || !phone}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  theme={{
                    colors: { primary: colors.primary[500] },
                    roundness: 12,
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                <View style={styles.infoContainer}>
                  <Icon
                    name="shield-check"
                    size={16}
                    color={colors.primary[400]}
                  />
                  <Text style={styles.infoText}>
                    Your data is encrypted and secure
                  </Text>
                </View>
              </AnimatedCard>

              {/* Help Section */}
              <AnimatedCard delay={600}>
                <TouchableOpacity style={styles.helpContainer}>
                  <Icon
                    name="help-circle"
                    size={20}
                    color={colors.primary[600]}
                  />
                  <Text style={styles.helpText}>
                    Need help? Contact support
                  </Text>
                </TouchableOpacity>
              </AnimatedCard>
            </Animated.View>

            {/* Footer */}
            <Animated.View
              entering={FadeInDown.delay(800).duration(600)}
              style={styles.footer}
            >
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service
              </Text>
              <Text style={styles.footerText}>
                Not authorized? Contact{' '}
                <Text style={styles.linkText}>rehabos@team.com</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginLeft: 8,
  },
  formDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.background.paper,
    fontSize: typography.fontSize.base,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    paddingLeft: 16,
  },
  button: {
    marginBottom: 16,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  infoText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[600],
    marginLeft: 6,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  linkText: {
    color: colors.primary[600],
    fontFamily: typography.fontFamily.medium,
  },
});
