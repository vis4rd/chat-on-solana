import "./assets/main.css";
import App from "@/App.vue";
import router from "@/router";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { Cluster } from "@solana/web3.js";
import SolanaWallets from "solana-wallets-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import "solana-wallets-vue/styles.css";

const walletOptions = { wallets: [new PhantomWalletAdapter()], autoConnect: false, cluster: "devnet" as Cluster };

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(SolanaWallets, walletOptions);

app.mount("#app");

useAnchorWorkspaceStore().initialize();
