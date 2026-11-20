import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { Plus, Search, X } from "lucide-react-native";
import JobCard from "../../components/jobs/JobCard";
import EmptyState from "../../components/EmptyState";
import ScreenHeader from "../../components/ui/ScreenHeader";
import { JobApplication } from "../../types/jobs";
import { searchJobs } from "../../utils/jobUtils";
import { useTheme } from "../../context/themeContext";
import { useJobs } from "../../context/jobContext";
import { ThemeColors } from "../../constants/colors";
import { useAuth } from "../../context/authContext";
import { MotiView } from "moti";
import {
  dimensions,
  motion,
  radius,
  spacing,
  touchHitSlop,
} from "../../constants/design-tokens";

const JobsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { jobs, refreshJobs } = useJobs();
  const { isPremium } = useAuth();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setFilteredJobs(searchJobs(jobs, debouncedSearchQuery));
    } else {
      setFilteredJobs(jobs);
    }
  }, [debouncedSearchQuery, jobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshJobs();
    setRefreshing(false);
  };

  const handleAddJob = () => {
    if (!isPremium && jobs.length >= 7) {
      Alert.alert(
        "Upgrade to Pro",
        "You've reached the free limit of 7 jobs. Upgrade to Pro to track unlimited jobs!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "View Options", onPress: () => router.push("/(tabs)/settings") },
        ]
      );
      return;
    }
    router.push("/(modals)/add-job");
  };

  const handleJobPress = (job: JobApplication) => {
    router.push(`/(modals)/job/${job.id}` as RelativePathString);
  };

  const styles = createStyles(theme);

  return (
    // Root layout already provides the top safe-area inset.
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: motion.slow }}
      >
        <ScreenHeader
          title="Applications"
          subtitle={`${jobs.length} total · ${jobs.filter(j => j.status === "interviewing").length} interviewing`}
        />
      </MotiView>

      <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
        <Search size={18} color={searchFocused ? theme.primary : theme.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by company, role, or tag..."
          placeholderTextColor={theme.text.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={touchHitSlop}
            style={styles.clearButton}
          >
            <X size={16} color={theme.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[...filteredJobs].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <JobCard job={item} index={index} onPress={handleJobPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={searchQuery.trim() ? "No Results Found" : "No Applications Yet"}
            message={searchQuery.trim() ? "Try adjusting your search query." : "Start tracking your job applications by adding your first one."}
            action={!searchQuery.trim() ? {
              label: "Add Your First Job",
              onPress: handleAddJob,
            } : undefined}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddJob}
        activeOpacity={0.85}
      >
        <Plus size={26} color="white" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: theme.border,
      paddingHorizontal: spacing.lg,
      marginHorizontal: dimensions.screenPadding,
      marginBottom: spacing.md,
      height: dimensions.inputHeight,
    },
    searchContainerFocused: {
      borderColor: theme.primary,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: theme.text.primary,
      fontFamily: "Inter-Regular",
      fontSize: 15,
    },
    clearButton: {
      padding: spacing.sm,
    },
    listContent: {
      paddingHorizontal: dimensions.screenPadding,
      paddingBottom: 120,
      flexGrow: 1,
    },
    fab: {
      position: "absolute",
      bottom: spacing.xxl,
      right: spacing.xxl,
      width: 58,
      height: 58,
      borderRadius: radius.full,
      backgroundColor: theme.action,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
  });
};

export default JobsScreen;
