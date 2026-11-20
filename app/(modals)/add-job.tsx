import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import Text from "../../components/ui/Text";
import Button from "../../components/ui/Button";
import ScreenHeader from "../../components/ui/ScreenHeader";
import logger from "../../utils/logger";
import Card from "../../components/ui/Card";
import { useTheme } from "../../context/themeContext";
import { createJob } from "../../utils/storage";
import { jobStatusEnum } from "../../constants/jobStatus";
import {
  Building2,
  BriefcaseIcon,
  MapPin,
  DollarSign,
  Calendar,
  Globe,
  User,
  Mail,
  Save,
  MessageSquareText
} from "lucide-react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import { ThemeColors } from "../../constants/colors";
import { useJobs } from "../../context/jobContext";
import { MotiView } from "moti";
import {
  dimensions,
  motion,
  radius,
  spacing,
} from "../../constants/design-tokens";

const jobSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job title/role is required"),
  location: z.string().min(1, "Location is required"),
  salary: z.string().optional(),
  dateApplied: z.string().nonempty("Date applied is required"),
  status: jobStatusEnum,
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function NewJobModal() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const { addJobFromContext } = useJobs();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: "",
      role: "",
      location: "",
      salary: "",
      dateApplied: new Date().toISOString().substring(0, 10),
      status: "applied",
      url: "",
      followUpDate: "",
      notes: "",
      contactPerson: "",
      contactEmail: "",
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);

  const rawDateApplied = watch("dateApplied");
  const rawFollowUpDate = watch("followUpDate");

  const dateAppliedValue = rawDateApplied
    ? new Date(rawDateApplied)
    : new Date();

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Store an ISO date string (yyyy-MM-dd), matching the follow-up picker
      // and the form default, so submit-time parsing is unambiguous.
      setValue("dateApplied", selectedDate.toISOString().substring(0, 10));
    }
  };

  const followUpValue = rawFollowUpDate ? new Date(rawFollowUpDate) : null;

  const onChangeFollowUpDate = (event: any, selectedDate?: Date) => {
    setShowFollowUpDatePicker(false);
    if (selectedDate) {
      setValue("followUpDate", selectedDate.toISOString().substring(0, 10));
    }
  };

  const onSubmit = async (values: JobFormData) => {
    try {
      const newJob = createJob({
        ...values,
        dateApplied: new Date(values.dateApplied).toISOString(),
      });

      await addJobFromContext(newJob);
      router.back();
    } catch (err) {
      logger.error("Failed to save job:", err);
    }
  };

  return (
    // Root layout owns the top inset; this screen owns the bottom one.
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScreenHeader title="Add Job" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: motion.slow }}
          >
            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.sectionTitleWrapper}>
                <Text variant="h4" weight="bold">Core Information</Text>
              </View>

              <Controller
                control={control}
                name="company"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Company"
                    placeholder="Enter company name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.company?.message}
                    leftIcon={<Building2 size={20} color={theme.text.secondary} />}
                  />
                )}
              />
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Job Title/Role"
                    placeholder="Enter job title or role"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.role?.message}
                    leftIcon={<BriefcaseIcon size={20} color={theme.text.secondary} />}
                  />
                )}
              />
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Location"
                    placeholder="Enter job location"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.location?.message}
                    leftIcon={<MapPin size={20} color={theme.text.secondary} />}
                  />
                )}
              />
              <Controller
                control={control}
                name="salary"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Salary (Optional)"
                    placeholder="Enter salary range"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.salary?.message}
                    leftIcon={<DollarSign size={20} color={theme.text.secondary} />}
                  />
                )}
              />
            </Card>

            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.sectionTitleWrapper}>
                <Text variant="h4" weight="bold">Timeline & Status</Text>
              </View>

              <Input
                label="Date Applied"
                value={dateAppliedValue ? format(dateAppliedValue, "yyyy-MM-dd") : ""}
                onPressIn={() => setShowDatePicker(true)}
                leftIcon={<Calendar size={20} color={theme.text.secondary} />}
                showSoftInputOnFocus={false}
                pointerEvents="none"
              />

              {showDatePicker && (
                <DateTimePicker
                  value={dateAppliedValue || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}

              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text variant="label" weight="medium" color="secondary" style={styles.label}>
                      Status
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                        dropdownIconColor={theme.text.secondary}
                      >
                        <Picker.Item label="Applied" value="applied" />
                        <Picker.Item label="Interviewing" value="interviewing" />
                        <Picker.Item label="Offered" value="offered" />
                        <Picker.Item label="Rejected" value="rejected" />
                        <Picker.Item label="Accepted" value="accepted" />
                        <Picker.Item label="Declined" value="declined" />
                      </Picker>
                    </View>
                  </View>
                )}
              />
            </Card>

            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.sectionTitleWrapper}>
                <Text variant="h4" weight="bold">Additional Details</Text>
              </View>

              <Controller
                control={control}
                name="url"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Job URL (Optional)"
                    placeholder="https://..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.url?.message}
                    autoCapitalize="none"
                    keyboardType="url"
                    leftIcon={<Globe size={20} color={theme.text.secondary} />}
                  />
                )}
              />

              <View style={styles.inputSpacing}>
                <Input
                  label="Follow-up Date (Optional)"
                  value={followUpValue ? format(followUpValue, "yyyy-MM-dd") : ""}
                  onPressIn={() => setShowFollowUpDatePicker(true)}
                  leftIcon={<Calendar size={20} color={theme.text.secondary} />}
                  showSoftInputOnFocus={false}
                  pointerEvents="none"
                />

                {followUpValue && (
                  <Button
                    title="Clear Follow-up Date"
                    onPress={() => setValue("followUpDate", "")}
                    variant="outline"
                    style={{ marginTop: spacing.sm }}
                  />
                )}

                {showFollowUpDatePicker && (
                  <DateTimePicker
                    value={followUpValue || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeFollowUpDate}
                    minimumDate={new Date()}
                    maximumDate={
                      new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    }
                  />
                )}
              </View>

              <Controller
                control={control}
                name="contactPerson"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Contact Person (Optional)"
                    placeholder="Enter contact name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.contactPerson?.message}
                    leftIcon={<User size={20} color={theme.text.secondary} />}
                  />
                )}
              />
              <Controller
                control={control}
                name="contactEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Contact Email (Optional)"
                    placeholder="Enter contact email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.contactEmail?.message}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    leftIcon={<Mail size={20} color={theme.text.secondary} />}
                  />
                )}
              />
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Notes (Optional)"
                    placeholder="Add any notes about this application"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.notes?.message}
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    leftIcon={<MessageSquareText size={20} color={theme.text.secondary} style={{ marginTop: 8 }} />}
                  />
                )}
              />
            </Card>

            <View style={styles.buttonsContainer}>
              <Button
                title="Save Job"
                leftIcon={<Save size={20} color={theme.background} />}
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                style={styles.saveButton}
              />
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      padding: dimensions.screenPadding,
      paddingBottom: spacing.xxxl,
    },
    formCard: {
      padding: dimensions.cardPadding,
      marginBottom: dimensions.sectionGap,
    },
    sectionTitleWrapper: {
      marginBottom: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider + "80",
    },
    inputSpacing: {
      marginBottom: spacing.lg,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
      paddingTop: spacing.sm,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    saveButton: {
      flex: 1,
      borderRadius: radius.xxl,
      height: dimensions.buttonHeight.large,
    },
    inputWrapper: {
      marginBottom: spacing.lg,
    },
    label: {
      marginBottom: spacing.sm,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.lg,
      backgroundColor: theme.background,
      overflow: "hidden",
    },
    picker: {
      color: theme.text.primary,
      height: dimensions.inputHeight,
      paddingHorizontal: spacing.sm,
    },
    pickerItem: {
      color: theme.text.primary,
      fontSize: 16,
    },
  });
