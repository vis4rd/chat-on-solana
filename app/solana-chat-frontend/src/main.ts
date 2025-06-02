import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import SolanaWallets from "solana-wallets-vue";

import App from "./App.vue";
import router from "./router";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "solana-wallets-vue/styles.css";
import { initWorkspace } from "./anchor/workspace";

const walletOptions = {
    wallets: [new PhantomWalletAdapter()],
    autoConnect: true,
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(SolanaWallets, walletOptions);

app.mount("#app");

initWorkspace();
