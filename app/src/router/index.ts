import WelcomeView from "@/views/WelcomeView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: "/welcome", name: "welcome", component: WelcomeView },
        {
            path: "/newconversation",
            name: "newconversation",
            component: () => import("../views/NewConversationView.vue"),
        },
        { path: "/register", name: "register", component: () => import("../views/RegisterView.vue") },
        { path: "/chat", name: "chat", component: () => import("../views/ChatView.vue") },
    ],
});

export default router;
