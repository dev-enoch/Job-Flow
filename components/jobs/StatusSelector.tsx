import { View, ScrollView } from "react-native";
import Button from "../ui/Button";
import { useTheme } from "../../context/themeContext";
import { JobStatus } from "../../constants/jobStatus";
import { MotiView } from "moti";

const statusOptions: JobStatus[] = [
  "applied",
  "interviewing",
  "offered",
  "accepted",
  "rejected",
  "declined",
];

export default function StatusSelector({
  currentStatus,
  onSelect,
}: {
  currentStatus: JobStatus;
  onSelect: (status: JobStatus) => void;
}) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {statusOptions.map((status, index) => (
        <MotiView
          key={status}
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 100 * index, damping: 14 }}
        >
          <Button
            title={status.charAt(0).toUpperCase() + status.slice(1)}
            variant={currentStatus === status ? "primary" : "outline"}
            size="small"
            onPress={() => onSelect(status)}
            style={{ minWidth: 110 }}
          />
        </MotiView>
      ))}
    </ScrollView>
  );
}
