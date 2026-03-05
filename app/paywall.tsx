import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

export default function PaywallScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Paywall</Text>
    </SafeAreaView>
  );
}