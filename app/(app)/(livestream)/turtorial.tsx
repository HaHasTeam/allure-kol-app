import { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, Card } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";

const { width } = Dimensions.get("window");

// Update the tutorial steps colors to match the new theme
const tutorialSteps = [
  {
    title: "Schedule Your Livestreams",
    description:
      "Plan ahead by scheduling your livestreams. Your audience will receive notifications when you're about to go live.",
    icon: "calendar",
    color: myTheme.lightPrimary,
    iconColor: myTheme.primary,
  },
  {
    title: "Go Live Anytime",
    description:
      "Start streaming with just a tap. Connect with your audience in real-time and showcase your content.",
    icon: "video",
    color: myTheme.lighter,
    iconColor: myTheme.primary,
  },
  {
    title: "Showcase Products",
    description:
      "Add products to your livestream that viewers can purchase directly while watching.",
    icon: "shopping-bag",
    color: myTheme.lightGrey,
    iconColor: myTheme.yellow,
  },
  {
    title: "Engage With Viewers",
    description:
      "Interact with your audience through live chat, polls, and Q&A sessions.",
    icon: "users",
    color: myTheme.lightPrimary,
    iconColor: myTheme.grey,
  },
  {
    title: "Earn Through Gifts",
    description:
      "Receive virtual gifts from your viewers that can be converted to real earnings.",
    icon: "gift",
    color: "#fff5e6", // Light yellow background
    iconColor: myTheme.yellow,
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Animation for slide transition
  const slideX = useSharedValue(0);

  const slideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      slideX.value = withTiming(
        -width,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        () => {
          slideX.value = width;
          setCurrentStep(currentStep + 1);
          slideX.value = withTiming(0, {
            duration: 300,
            easing: Easing.out(Easing.ease),
          });
        }
      );
    } else {
      // Tutorial complete
      router.push("/(app)");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      slideX.value = withTiming(
        width,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        () => {
          slideX.value = -width;
          setCurrentStep(currentStep - 1);
          slideX.value = withTiming(0, {
            duration: 300,
            easing: Easing.out(Easing.ease),
          });
        }
      );
    }
  };

  const skipTutorial = () => {
    router.push("/(app)");
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={skipTutorial}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.dotsContainer}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.activeDot]}
            />
          ))}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.slideContainer, slideStyle]}>
          <Card style={styles.card}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentTutorial.color },
              ]}
            >
              <Feather
                name={currentTutorial.icon}
                size={48}
                color={currentTutorial.iconColor}
              />
            </View>

            <Text style={styles.title}>{currentTutorial.title}</Text>
            <Text style={styles.description}>
              {currentTutorial.description}
            </Text>

            <View style={styles.buttonsContainer}>
              <Button
                outline
                outlineColor={myTheme.borderColor}
                style={[styles.navButton, styles.prevButton]}
                disabled={currentStep === 0}
                onPress={prevStep}
              >
                <Feather
                  name="chevron-left"
                  size={24}
                  color={currentStep === 0 ? "#ccc" : myTheme.textColor}
                />
              </Button>

              <Button
                label={
                  currentStep === tutorialSteps.length - 1
                    ? "Get Started"
                    : "Next"
                }
                backgroundColor={myTheme.primary}
                style={styles.nextButton}
                onPress={nextStep}
                iconSource={
                  currentStep !== tutorialSteps.length - 1
                    ? () => (
                        <Feather
                          name="chevron-right"
                          size={20}
                          color="#fff"
                          style={styles.nextIcon}
                        />
                      )
                    : undefined
                }
                iconOnRight
              />
            </View>
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  skipText: {
    fontSize: 14,
    color: myTheme.textColorLight,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 3,
  },
  // Update the activeDot style to use the new primary color
  activeDot: {
    backgroundColor: myTheme.primary,
    width: 24,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  slideContainer: {
    width: "100%",
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: myTheme.textColor,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: myTheme.textColorLight,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: "transparent",
  },
  // Update the nextButton style to use the new primary color
  nextButton: {
    flex: 1,
    marginLeft: 16,
    height: 48,
    borderRadius: 24,
  },
  nextIcon: {
    marginLeft: 8,
  },
});
