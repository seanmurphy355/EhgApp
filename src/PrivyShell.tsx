import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App";
import { Provider } from "./components/ui/provider";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";
const PRIVY_CLIENT_ID = import.meta.env.VITE_PRIVY_CLIENT_ID as string | undefined;

export default function PrivyShell() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        appearance: { theme: "dark" },
      }}
    >
      <Provider>
        <App />
      </Provider>
    </PrivyProvider>
  );
}
