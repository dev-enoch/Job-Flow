import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RestoreDialog from "../../components/settings/RestoreDialogue";

export default function RestoreModal() {
  return (
    // Root layout owns the top inset; this modal owns the bottom one.
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <RestoreDialog />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
