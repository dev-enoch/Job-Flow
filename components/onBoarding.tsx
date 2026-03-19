import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { BriefcaseIcon, CalendarCheck, BarChart3 } from "lucide-react-native";
import Text from "./ui/Text";
import { ThemeColors } from "../constants/colors";
import { useTheme } from "../context/themeContext";
import Button from "./ui/Button";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");

type Slide = {
  id: string;
  title: string;
  description: string;
  icon: (theme: ThemeColors) => React.ReactNode;
  accentColor: (theme: ThemeColors) => string;
  bgColor: (theme: ThemeColors) => string;
};

const slides: Slide[] = [
  {
    id: "1",
    title: "Track your job applications in one place",
    description: "Keep all your job applications organized and never miss an opportunity again.",
    icon: (theme) => <BriefcaseIcon size={64} color={theme.primary} />,
    accentColor: (theme) => theme.primary,
    bgColor: (theme) => theme.primaryLight,
  },
  {
    id: "2",
    title: "Stay organized and follow up easily",
    description: "Get reminders for follow-ups and keep track of your application status every step of the way.",
    icon: (theme) => <CalendarCheck size={64} color={theme.success} />,
    accentColor: (theme) => theme.success,
    bgColor: (theme) => theme.successLight,
  },
  {
    id: "3",
    title: "Understand your job hunt at a glance",
    description: "Visualize your progress with beautiful charts and smart analytics built just for job seekers.",
    icon: (theme) => <BarChart3 size={64} color={theme.accent} />,
    accentColor: (theme) => theme.accent,
    bgColor: (theme) => theme.accentLight,
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => Promise<void> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor(theme) }]}>
          {item.icon(theme)}
        </View>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 150 }}
      >
        <Text variant="h2" weight="bold" style={styles.title} align="center">
          {item.title}
        </Text>
        <Text color="secondary" align="center" style={styles.description}>
          {item.description}
        </Text>
      </MotiView>
    </View>
  );

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      await onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <MotiView
              key={index}
              animate={{
                width: index === currentIndex ? 28 : 8,
                backgroundColor:
                  index === currentIndex
                    ? slide.accentColor(theme)
                    : theme.border,
              }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.paginationDot}
            />
          ))}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? "Get Started 🚀" : "Continue →"}
          onPress={handleNext}
          style={styles.button}
        />

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
            <Text color="secondary" style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    slide: {
      width,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 48,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 32,
      elevation: 8,
    },
    title: {
      marginBottom: 16,
      lineHeight: 36,
      fontSize: 26,
    },
    description: {
      lineHeight: 26,
      fontSize: 16,
      paddingHorizontal: 8,
    },
    footer: {
      padding: 32,
      paddingBottom: 48,
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      gap: 6,
    },
    paginationDot: {
      height: 8,
      borderRadius: 4,
    },
    button: {
      marginBottom: 16,
      borderRadius: 28,
      height: 56,
    },
    skipButton: {
      alignItems: "center",
      paddingVertical: 8,
    },
    skipText: {
      fontSize: 15,
    },
  });
};
