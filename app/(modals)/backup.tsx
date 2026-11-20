import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackupDialog from "../../components/settings/BackupDialog";

export default function BackupModal() {
  return (
    // Root layout owns the top inset; this modal owns the bottom one.
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <BackupDialog />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
